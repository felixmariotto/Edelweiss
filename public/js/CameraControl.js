

function CameraControl( player, camera ) {


	const ORBITCONTROLS = false ;

	var group = new THREE.Group();

	var testRays;
	var lastValidRayDir = 'right' ; // either right or left
	var lastInvalidRayDir = 'left' ;

	var rayOriginVec = new THREE.Vector3().copy( player.position );
	rayOriginVec.y += 0.7

	// testRays directions
	const BOTTOMLEFTDIR = new THREE.Vector3( -0.35, 0.3, 1 ).normalize();
	const BOTTOMRIGHTDIR = new THREE.Vector3( 0.35, 0.3, 1 ).normalize();
	const TOPLEFTDIR = new THREE.Vector3( -0.12, 0.7, 0.6 ).normalize();
	const TOPRIGHTDIR = new THREE.Vector3( 0.12, 0.7, 0.6 ).normalize();

	// camera end vectors depending on ray intersection
	const BOTTOMLEFTENDVEC = new THREE.Vector3( -1, 3, 6 );
	const BOTTOMRIGHTENDVEC = new THREE.Vector3( 1, 3, 6 );
	const TOPLEFTENDVEC = new THREE.Vector3( 1, 7, 6 );
	const TOPRIGHTENDVEC = new THREE.Vector3( -1, 7, 6 );
	const DEFAULTENDVEC = new THREE.Vector3( 0, 5, 5 );

	var cameraPosTarget = BOTTOMRIGHTENDVEC ;






	// INIT

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
				left : new THREE.Ray( rayOriginVec, BOTTOMLEFTDIR ),
				right : new THREE.Ray( rayOriginVec, BOTTOMRIGHTDIR )
			},

			top : {
				left : new THREE.Ray( rayOriginVec, TOPLEFTDIR ),
				right : new THREE.Ray( rayOriginVec, TOPRIGHTDIR )
			}

		};


		testRays.bottom.left.cameraEndVec = BOTTOMLEFTENDVEC ;
		testRays.bottom.right.cameraEndVec = BOTTOMRIGHTENDVEC ;
		testRays.top.left.cameraEndVec = TOPLEFTENDVEC ;
		testRays.top.right.cameraEndVec = TOPRIGHTENDVEC ;


		for ( let level of Object.keys( testRays ) ) {

			for ( let ray of Object.keys( testRays[ level ] ) ) {

				let arrowHelper = new THREE.ArrowHelper(
					testRays[ level ][ ray ].direction,
					testRays[ level ][ ray ].origin,
					4
				);

				scene.add( arrowHelper );

			};

		};


	};





	function update( intersectRays ) {

		group.position.copy( player.position );

		// RAY INTERSECTION WITH LOGIC SCENE

		if ( intersectRays ) {

			// Update rays origin
			rayOriginVec.copy( player.position );
			rayOriginVec.y += 0.7

			// test bottom vector first
			if ( atlas.intersectRay( testRays.bottom[ lastValidRayDir ], false ) ) {

				// there is a new intersection with this ray,
				// consequently, we want to know if we can shift the
				// camera to the opposite direction, same level (bottom)

				if ( atlas.intersectRay( testRays.bottom[ lastInvalidRayDir ], false ) ) {

					// Both bottom rays are intersecting, now we must consider
					// positioning the camera on top of the player, so we check
					// both top rays to know on which side.

					if ( atlas.intersectRay( testRays.top[ lastValidRayDir ], false ) ) {

						// The top ray of the same side as the last valid ray
						// is not free, so we perform a last check to know if we can
						// just position it on the other side (still top of the player)

						if ( atlas.intersectRay( testRays.top[ lastInvalidRayDir ], false ) ) {

							cameraPosTarget = DEFAULTENDVEC ;

						} else {

							// The opposite top ray is free

							cameraPosTarget = testRays.top[ lastValidRayDir ].cameraEndVec ;

							// we toggle values of valid direction, for the next frame
							[ lastValidRayDir, lastInvalidRayDir ] = [ lastInvalidRayDir, lastValidRayDir ];

						};

					} else {

						// The top ray of the same side as the last valid ray
						// is free

						cameraPosTarget = testRays.top[ lastInvalidRayDir ].cameraEndVec ;

					};

				} else {

					// The opposite bottom ray is free

					cameraPosTarget = testRays.bottom[ lastInvalidRayDir ].cameraEndVec ;

					// we toggle values of valid direction, for the next frame
					[ lastValidRayDir, lastInvalidRayDir ] = [ lastInvalidRayDir, lastValidRayDir ];

				};

			} else {

				// the bottom valid ray is free

				cameraPosTarget = testRays.bottom[ lastValidRayDir ].cameraEndVec ;

			};

		};



		//// CAMERA UPDATE

		camera.position.copy( cameraPosTarget );
    	camera.lookAt( player.position );

	};




	return {
		update
	};

};