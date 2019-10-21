

function CameraControl( player, camera ) {


	const ORBITCONTROLS = false ;

	var group = new THREE.Group();

	// INIT
	camera.position.set( 1, 3, 6 );
    camera.lookAt( 0, 0, 0 );

	if ( ORBITCONTROLS ) {

		//// OrbitControl part for test
		orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
		orbitControls.screenSpacePanning = true ;
	    orbitControls.keys = [];

	} else {

		scene.add( group );
		group.add( camera );
		group.position.copy( player.position );

	};


	function update() {
		group.position.copy( player.position );
	};


	return {
		update
	};

};