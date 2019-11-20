

function CameraControl( player, camera ) {


	const ORBITCONTROLS = false ;


	var group = new THREE.Group();
	scene.add( group );


	const MAX_YAW = 0.2 ;
	const CAMERA_DIRECTION = new THREE.Vector3( 0, 0.3, 1 ).normalize();
	const DEFAULT_CAMERA_DISTANCE = 3.5 ;
	const MIN_CAMERA_DISTANCE = 1.2 ;
	const CAMERA_COLLISION_DISTANCE = 0.5; // hit box size
	const CAMERA_TWEENING_SPEED = 0.1 ;

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

		group.add( camera );
		group.position.copy( player.position );

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

		group.position.copy( player.position );

		////// GET INTERSECTION POINTS ON RIGHT AND LEFT OF PLAYER

		testRayOrigin.copy( player.position );
		testRayOrigin.y += atlas.PLAYERHEIGHT / 2 ;

		/// LEFT

		testRayDirection.set( -1, 0, 0 );

		let stages = [
			Math.floor( player.position.y ) -1,
			Math.floor( player.position.y ),
			Math.floor( player.position.y ) +1
		];

		let intersectVec = atlas.intersectRay( testRay, stages, true );

		let intersectionLeft = intersectVec ? intersectVec.x : false ;

		/// RIGHT

		testRayDirection.set( 1, 0, 0 );

		intersectVec = atlas.intersectRay( testRay, stages, false );



		let intersectionRight = intersectVec ? intersectVec.x : false ;

		// console.log( intersectionRight );

		/*
		if ( intersectionLeft && intersectionRight ) {
			console.log('intersectionLeft : ' + intersectionLeft);
			console.log('intersectionRight : ' + intersectionRight);
			debugger
		};
		*/

		/// ANGLE OF CAMERA RAY

		if ( intersectionLeft === false &&
			 intersectionRight === false ) {

		 	var leftRightRatio = 0.5 ;

		} else if ( intersectionLeft === false ) {

			var leftRightRatio = 1 ;

		} else if ( intersectionRight === false ) {

			var leftRightRatio = 0 ;

		} else {

			var leftRightRatio = ( player.position.x - intersectionLeft ) /
								 ( intersectionRight - intersectionLeft );

		};

		let angle = Math.asin( (leftRightRatio * 2) -1 );

		/*
		if ( !angle ) {
			console.log( 'leftRightRatio = ' + leftRightRatio );
			console.log( Math.asin( (leftRightRatio * 2) -1 ) );
			debugger
		}\
		*/

		// contraint to MAX_YAW
		angle = (angle * MAX_YAW) / (Math.PI / 2) ;


		/// INTERSECT CAMERA RAY

		cameraRayDirection.copy( CAMERA_DIRECTION );

		cameraRayDirection.applyAxisAngle(
			cameraRayAxis,
			-angle
		);






		/*

		group.localToWorld( cameraRayOrigin );

		var arrowHelper = new THREE.ArrowHelper( cameraRayDirection, cameraRayOrigin, 10 );
		scene.add( arrowHelper );

		group.worldToLocal( cameraRayOrigin );

		*/



		/// CAMERA DISTANCE



		/*
		THIS PRODUCED WEIRD JERKS TOWARD PLAYER WHEN THEY
		WALKED BEHIND AN OBSTACLE

		stages = [
			Math.floor( player.position.y ),
			Math.floor( player.position.y ) +1,
			Math.floor( player.position.y ) +2,
			Math.floor( player.position.y ) +3,
			Math.floor( player.position.y ) +4,
		];

		group.localToWorld( cameraRayOrigin );

		let rayCollision = atlas.intersectRay( cameraRay, stages, true );

		group.worldToLocal( cameraRayOrigin );

		if ( rayCollision ) {

			group.worldToLocal( rayCollision );

			var distCamera = rayCollision.distanceTo( cameraRay.origin );

			// TEMP
			// setTimeout( ()=> {debugger}, 100);

		} else {

			var distCamera = DEFAULT_CAMERA_DISTANCE ;

		};

		if ( distCamera < MIN_CAMERA_DISTANCE ) {

			distCamera = DEFAULT_CAMERA_DISTANCE ;

		};

		cameraRay.at( distCamera * 0.95, cameraWantedPos );

		*/

		distCamera = DEFAULT_CAMERA_DISTANCE ;

		cameraRay.at( distCamera, cameraWantedPos );



		/// CAMERA COLLISION

		group.localToWorld( camera.position );

		stages = [
			Math.floor( camera.position.y ) -1,
			Math.floor( camera.position.y ),
			Math.floor( camera.position.y ) +1
		];

		group.worldToLocal( camera.position );

		/*
		checkCameraCollision( cameraColRayTop );
		checkCameraCollision( cameraColRayBottom );
		checkCameraCollision( cameraColRayRight );
		checkCameraCollision( cameraColRayLeft );
		*/

		function checkCameraCollision( ray ) {

			cameraRay.at( distCamera, ray.origin );

			group.localToWorld( ray.origin );

			rayCollision = atlas.intersectRay( ray, stages, true ) ;

			if ( rayCollision &&
				 camera.position.distanceTo( group.worldToLocal( rayCollision ) ) < CAMERA_COLLISION_DISTANCE ) {

				let dist = camera.position.distanceTo( rayCollision );

				cameraOffsetVec.copy( ray.direction )
							   .multiplyScalar( 1 - dist )
							   .negate();

				console.log( dist );

				cameraWantedPos.add( cameraOffsetVec );

			};

		};

		




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