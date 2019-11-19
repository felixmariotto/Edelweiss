

function CameraControl( player, camera ) {


	const ORBITCONTROLS = false ;


	var group = new THREE.Group();
	scene.add( group );

	var rayOrigin = new THREE.Vector3();
	var rayDirection = new THREE.Vector3();
	var testRay = new THREE.Ray( rayOrigin, rayDirection );


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

		rayOrigin.copy( player.position );
		rayOrigin.y += atlas.PLAYERHEIGHT / 2 ;

		/// LEFT

		rayDirection.set( -1, 0, 0 );

		let stages = [
			Math.floor( player.position.y ) -1,
			Math.floor( player.position.y ),
			Math.floor( player.position.y ) +1
		];

		let intersectVec = atlas.intersectRay( testRay, stages, true );

		let intersectionLeft = intersectVec ? intersectVec.x : false ;

		/// RIGHT

		rayDirection.set( 1, 0, 0 );

		intersectVec = atlas.intersectRay( testRay, stages, false );

		let intersectionRight = intersectVec ? intersectVec.x : false ;

		// console.log( intersectionRight );

		let leftRightRatio ;

		if ( intersectionLeft === false &&
			 intersectionRight === false ) {

		 leftRightRatio = 0.5 ;

		} else if ( intersectionLeft === false ) {

			leftRightRatio = 1 ;

		} else if ( intersectionRight === false ) {

			leftRightRatio = 0 ;

		} else {

			leftRightRatio = ( player.position.x - intersectionLeft ) /
								 ( intersectionRight - intersectionLeft );

		};
		

		console.log( leftRightRatio );

	};











	return {
		update,
		directionalLight,
		adaptFOV
	};

};