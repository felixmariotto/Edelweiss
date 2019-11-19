

function CameraControl( player, camera ) {


	const ORBITCONTROLS = false ;


	var group = new THREE.Group();
	scene.add( group );


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

	};











	return {
		update,
		directionalLight,
		adaptFOV
	};

};