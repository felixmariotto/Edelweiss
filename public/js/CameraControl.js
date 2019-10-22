

function CameraControl( player, camera ) {


	const ORBITCONTROLS = false ;

	var group = new THREE.Group();

	var testRays;
	var lastValidDir = 'right' // either right or left

	// testRays directions
	const BOTTOMLEFTDIR = new THREE.Vector3( -0.2, 0.3, 1 ).normalize();
	const BOTTOMRIGHTDIR = new THREE.Vector3( 0.2, 0.3, 1 ).normalize();
	const TOPLEFTDIR = new THREE.Vector3( -0.2, 0.7, 1 ).normalize();
	const TOPRIGHTDIR = new THREE.Vector3( 0.2, 0.7, 1 ).normalize();

	// camera end vectors depending on ray intersection
	const BOTTOMLEFTENDVEC = new THREE.Vector3( -1, 3, 6 );
	const BOTTOMRIGHTENDVEC = new THREE.Vector3( 1, 3, 6 );
	const TOPLEFTENDVEC = new THREE.Vector3( 1, 7, 6 );
	const TOPRIGHTENDVEC = new THREE.Vector3( -1, 7, 6 );



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

		// TEST RAYS

		testRays = {

			bottom : {
				left : new THREE.Ray( player.position, BOTTOMLEFTDIR ),
				right : new THREE.Ray( player.position, BOTTOMRIGHTDIR )
			},

			top : {
				left : new THREE.Ray( player.position, TOPLEFTDIR ),
				right : new THREE.Ray( player.position, TOPRIGHTDIR )
			}

		};


		testRays.bottom.left.cameraEndVec = BOTTOMLEFTENDVEC ;
		testRays.bottom.right.cameraEndVec = BOTTOMRIGHTENDVEC ;
		testRays.top.left.cameraEndVec = TOPLEFTENDVEC ;
		testRays.top.right.cameraEndVec = TOPRIGHTENDVEC ;

		/*
		for ( let ray of Object.keys( testRays ) ) {

			console.log( testRays[ ray ] );

			let arrowHelper = new THREE.ArrowHelper(
				testRays[ ray ].direction,
				testRays[ ray ].origin,
				4
			);

			scene.add( arrowHelper )

		};
		*/

	};





	function update() {

		group.position.copy( player.position );

		// intersect rays with scene logic
		if ( atlas.intersectRay( testRays.bottom[ lastValidDir ], false ) ) {

			console.log( testRays.bottom[ lastValidDir ].cameraEndVec );

		};

	};




	return {
		update
	};

};