

function CameraControl( player, camera ) {


	const ORBITCONTROLS = true ;

	const NEEDARROWS = false ;

	var group = new THREE.Group();
	scene.add( group );

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
	const BOTTOMLEFTENDVEC = new THREE.Vector3( -0.5, 1.5, 3 );
	const BOTTOMRIGHTENDVEC = new THREE.Vector3( 0.5, 1.5, 3 );
	const TOPLEFTENDVEC = new THREE.Vector3( 0.15, 2.5, 2 );
	const TOPRIGHTENDVEC = new THREE.Vector3( -0.15, 2.5, 2 );
	const DEFAULTENDVEC = new THREE.Vector3( 0, 2, 3 );

	var t = 1 ;
	var cameraStartVec = new THREE.Vector3().copy( BOTTOMRIGHTENDVEC );
	var cameraEndVec = BOTTOMRIGHTENDVEC ;
	var cameraLookAtVec = new THREE.Vector3();

	camera.position.copy( BOTTOMRIGHTENDVEC );
	camera.lookAt( 0, 0, 0 );




	var directionalLight = addShadowedLight( 2.4, 7.8, 5.6, 0xe8f9ff, 0.45 );
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




	// INIT

	if ( ORBITCONTROLS ) {

		//// OrbitControl part for test
		orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
		orbitControls.screenSpacePanning = true ;
	    orbitControls.keys = [];

	} else {

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


		if ( NEEDARROWS ) {

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


	};





	function update( intersectRays ) {

		group.position.copy( player.position );

		if ( ORBITCONTROLS ) return

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

					if ( atlas.intersectRay( testRays.top[ lastValidRayDir ], true ) ) {

						// The top ray of the same side as the last valid ray
						// is not free, so we perform a last check to know if we can
						// just position it on the other side (still top of the player)

						if ( atlas.intersectRay( testRays.top[ lastInvalidRayDir ], true ) ) {

							updateCameraTarget( DEFAULTENDVEC ) ;

						} else {

							// The opposite top ray is free

							updateCameraTarget( testRays.top[ lastValidRayDir ].cameraEndVec );

							// we toggle values of valid direction, for the next frame
							[ lastValidRayDir, lastInvalidRayDir ] = [ lastInvalidRayDir, lastValidRayDir ];

						};

					} else {

						// The top ray of the same side as the last valid ray
						// is free

						updateCameraTarget( testRays.top[ lastInvalidRayDir ].cameraEndVec );

					};

				} else {

					// The opposite bottom ray is free

					updateCameraTarget( testRays.bottom[ lastInvalidRayDir ].cameraEndVec );

					// we toggle values of valid direction, for the next frame
					[ lastValidRayDir, lastInvalidRayDir ] = [ lastInvalidRayDir, lastValidRayDir ];

				};

			} else {

				// the bottom valid ray is free

				updateCameraTarget( testRays.bottom[ lastValidRayDir ].cameraEndVec );

			};

		};


		function updateCameraTarget( targetVec ) {
			
			if ( cameraEndVec != targetVec ) {

				t = 0 ;
				cameraStartVec.copy( camera.position );
				cameraEndVec = targetVec ;

			};

		};



		//// CAMERA UPDATE

		t += 0.013 ;
		if ( t > 1 ) t = 1 ;

		camera.position.lerpVectors(
			cameraStartVec,
			cameraEndVec,
			easing.easeInOutQuart( t )
		);

		cameraLookAtVec.copy( player.position );
		cameraLookAtVec.y += atlas.PLAYERHEIGHT ;
    	camera.lookAt( cameraLookAtVec );

	};




	return {
		update
	};

};