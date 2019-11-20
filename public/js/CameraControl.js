

function CameraControl( player, camera ) {


	const ORBITCONTROLS = false ;


	var group = new THREE.Group();
	scene.add( group );


	const MAX_YAW = 0.2 ;
	const CAMERA_DIRECTION = new THREE.Vector3( 0, 0.4, 1 ).normalize();
	const DEFAULT_CAMERA_DISTANCE = 3.5 ;
	const MIN_CAMERA_DISTANCE = 1.2 ;
	const CAMERA_COLLISION_DISTANCE = 0.5; // hit box size
	const CAMERA_TWEENING_SPEED = 0.1 ;

	var cameraTarget = new THREE.Vector3();
	var cameraWantedPos = new THREE.Vector3();

	var testRayOrigin = new THREE.Vector3();
	var testRayDirection = new THREE.Vector3();
	var testRay = new THREE.Ray( testRayOrigin, testRayDirection );

	var cameraRayOrigin = new THREE.Vector3( 0, 0.3, 0 );
	var cameraRayDirection = new THREE.Vector3();
	var cameraRayAxis = new THREE.Vector3( 0, 1, 0 );
	var cameraRay = new THREE.Ray( cameraRayOrigin, cameraRayDirection );

	var cameraOffsetVec = new THREE.Vector3();

	var cameraColRayTop = new THREE.Ray(
		new THREE.Vector3(),
		new THREE.Vector3( 0, 1, 0 )
	);

	var cameraColRayBottom = new THREE.Ray(
		new THREE.Vector3(),
		new THREE.Vector3( 0, -1, 0 )
	);

	var cameraColRayLeft = new THREE.Ray(
		new THREE.Vector3(),
		new THREE.Vector3( -1, 1, 0 )
	);

	var cameraColRayRight = new THREE.Ray(
		new THREE.Vector3(),
		new THREE.Vector3( 1, 1, 0 )
	);


	// TEMP
	camera.position.set( 0, 1.1, 3.5 );
	camera.lookAt( 0, 0, 0 );






	////////////////////
	/////    LIGHT
	////////////////////


	var directionalLight = addShadowedLight( 2.4, 7.8, 5.6, 0xffffff, 0.65 );
    group.add( directionalLight );
    group.add( directionalLight.target );



    function addShadowedLight( x, y, z, color, intensity ) {

        var directionalLight = new THREE.DirectionalLight( color, intensity );

        directionalLight.position.set( x, y, z );
        directionalLight.castShadow = true;

        var d = 8;

        directionalLight.shadow.camera.left = -d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = -d;
        directionalLight.shadow.camera.near = 5;
        directionalLight.shadow.camera.far = 18;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.bias = -0;

        /*
        var helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
        scene.add( helper );

    	helper = new THREE.CameraHelper( directionalLight.shadow.camera );
        scene.add( helper );
        helper.matrixAutoUpdate = true ;
        */

        return directionalLight;
    };











    ////////////////
	/////   INIT
	////////////////


	adaptFOV();



	if ( ORBITCONTROLS ) {

		//// OrbitControl part for test
		orbitControls = new THREE.OrbitControls( camera, document.querySelector('#joystick-container') );
		orbitControls.screenSpacePanning = true ;
	    orbitControls.keys = [];

	} else {

		scene.add( camera );

	};




	// Set the FOV depending on wether the display
	// is horizontal or vertical
	function adaptFOV() {

		// display is vertical
		if ( window.innerHeight > window.innerWidth ) {

			camera.fov = 80 ;
			camera.updateProjectionMatrix();

		// display is horizontal
		} else {

			camera.fov = 60 ;
			camera.updateProjectionMatrix();

		};

	};











	////////////////////////
	///   UPDATE
	//////////////////////



	function update( intersectRays ) {


		cameraTarget.copy( player.position );
		cameraTarget.y += atlas.PLAYERHEIGHT / 2 ;


		///////////////////////////////////////////////////////////////
		////// GET INTERSECTION POINTS ON RIGHT AND LEFT OF PLAYER

		testRay.origin.copy( cameraTarget );

		// get the scene graph stages to check
		let stages = [
			Math.floor( player.position.y ) -1,
			Math.floor( player.position.y ),
			Math.floor( player.position.y ) +1
		];



		/// LEFT

		testRay.direction.set( -1, 0, 0 );

		let intersectVec = atlas.intersectRay( testRay, stages, true );

		let intersectionLeft = intersectVec ? intersectVec.x : false ;



		/// RIGHT

		testRay.direction.set( 1, 0, 0 );

		intersectVec = atlas.intersectRay( testRay, stages, false );

		let intersectionRight = intersectVec ? intersectVec.x : false ;



		///////////////////////////////
		/// ANGLE OF CAMERA RAY

		if ( intersectionLeft === false &&
			 intersectionRight === false ) {

		 	var leftRightRatio = 0.5 ;

		} else if ( intersectionLeft === false ) {

			var leftRightRatio = 1 ;

		} else if ( intersectionRight === false ) {

			var leftRightRatio = 0 ;

		} else {

			// cross product to get a ratio between 0 and 1 where
			// 0 means a wall is very close on the LEFT, and
			// 1 a wall is very close on the RIGHT.
			var leftRightRatio = ( player.position.x - intersectionLeft ) /
								 ( intersectionRight - intersectionLeft );

		};

		// a radian angle between -1.57 and 1.57 is computed from the ratio
		let angle = Math.asin( (leftRightRatio * 2) -1 );



		// contraint to MAX_YAW
		angle = (angle * MAX_YAW) / (Math.PI / 2) ;






		/////////////////////////////////////////
		/// INTERSECT CAMERA RAY


		// The computed angle is applied to the ray we use
		// to position the camera

		cameraRay.origin.copy( cameraTarget );
		cameraRay.direction.copy( CAMERA_DIRECTION );

		cameraRay.direction.applyAxisAngle(
			cameraRayAxis,
			-angle
		);


		/// CAMERA DISTANCE

		// scene graph stages to check fo collision with camera ray
		stages = [
			Math.floor( player.position.y ),
			Math.floor( player.position.y ) +1,
			Math.floor( player.position.y ) +2,
			Math.floor( player.position.y ) +3,
			Math.floor( player.position.y ) +4,
		];

		let rayCollision = atlas.intersectRay( cameraRay, stages, true );

		if ( rayCollision ) {

			// We want to camera to be positioned at the intersection
			// between the ray and the obstacle
			var distCamera = rayCollision.distanceTo( cameraRay.origin );

		} else {

			var distCamera = DEFAULT_CAMERA_DISTANCE ;

		};

		// if the computed obstacle is far, no need to move camera.
		// And if it's too close, the camera would be too close from player,
		// so it's better to stay away and loose line of sight
		if ( distCamera < MIN_CAMERA_DISTANCE ||
			 distCamera > DEFAULT_CAMERA_DISTANCE ) {

			distCamera = DEFAULT_CAMERA_DISTANCE ;

		};

		// Set the vector cameraWantedPos at the computed point
		cameraRay.at( distCamera, cameraWantedPos );



		/// CAMERA COLLISION

		/*

		stages = [
			Math.floor( camera.position.y ) -1,
			Math.floor( camera.position.y ),
			Math.floor( camera.position.y ) +1
		];

		
		checkCameraCollision( cameraColRayTop );
		checkCameraCollision( cameraColRayBottom );
		checkCameraCollision( cameraColRayRight );
		checkCameraCollision( cameraColRayLeft );
		

		function checkCameraCollision( ray ) {

			cameraRay.at( distCamera, ray.origin );

			rayCollision = atlas.intersectRay( ray, stages, true ) ;

			if ( rayCollision &&
				 camera.position.distanceTo( rayCollision ) <
				 CAMERA_COLLISION_DISTANCE ) {

				let dist = camera.position.distanceTo( rayCollision );

				cameraOffsetVec.copy( ray.direction )
							   .clampLength( 0, dist );

				cameraOffsetVec.x = cameraOffsetVec.x * -1 ;

				cameraWantedPos.add( cameraOffsetVec );

			};

		};

		*/

		




		/// EASING


		// camera.position.copy( cameraWantedPos );

		camera.position.x = utils.lerp( camera.position.x, cameraWantedPos.x, CAMERA_TWEENING_SPEED );
		camera.position.y = utils.lerp( camera.position.y, cameraWantedPos.y, CAMERA_TWEENING_SPEED );
		camera.position.z = utils.lerp( camera.position.z, cameraWantedPos.z, CAMERA_TWEENING_SPEED );

		camera.lookAt( player.position )

	};











	return {
		update,
		directionalLight,
		adaptFOV
	};

};