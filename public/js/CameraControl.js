
function CameraControl( player, camera ) {

	var group = new THREE.Group();
	scene.add( group );

	const MAX_YAW = 0.2 ;
	const CAMERA_DIRECTION = new THREE.Vector3( 0, 0.4, 1 ).normalize();
	const DEFAULT_CAMERA_DISTANCE = 2.2 ;
	const MIN_CAMERA_DISTANCE = 1.7 ;
	const CAMERA_WIDTH = 0.29 ;
	const CAMERA_TWEENING_SPEED = 0.08 ;

	var backupCameraPos = new THREE.Vector3();
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

	/////////////
	///  LIGHT
	/////////////

	var directionalLight = addShadowedLight( 3, 25, 7, 0xffffff, 0.85 );
    group.add( directionalLight );
    group.add( directionalLight.target );

    function addShadowedLight( x, y, z, color, intensity ) {

        var directionalLight = new THREE.DirectionalLight( color, intensity );

        directionalLight.position.set( x, y, z );
        directionalLight.castShadow = true;

        var d = 10;

        directionalLight.shadow.camera.left = -d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = -d;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.bias = -0;

        return directionalLight;
    };

    function hideLight() {
    	directionalLight.visible = false;
    };

    function showLight() {
    	directionalLight.visible = true;
    };

    ///////////
	/// INIT
	///////////

	adaptFOV();

	resetCameraPos();

	scene.add( camera );

	// Set the FOV depending on wether the display
	// is horizontal or vertical
	function adaptFOV() {

		// display is vertical
		if ( window.innerHeight > window.innerWidth ) {

			camera.fov = 110 ;
			camera.updateProjectionMatrix();

		// display is horizontal
		} else {

			camera.fov = 90 ;
			camera.updateProjectionMatrix();

		};

	};

	////////////////////////
	///   UPDATE
	//////////////////////

	function update( delta ) {

		group.position.copy( player.position );
		group.position.z -= 7 ;

		cameraTarget.copy( player.position );
		cameraTarget.y += atlas.PLAYERHEIGHT / 2 ;

		//////////////////////////////////////////////////////////
		/// GET INTERSECTION POINTS ON RIGHT AND LEFT OF PLAYER
		//////////////////////////////////////////////////////////

		testRay.origin.copy( cameraTarget );

		// get the scene graph stages to check
		let stages = [
			Math.floor( player.position.y ),
			Math.floor( player.position.y ) + 1 ,
			Math.floor( player.position.y ) - 1
		];

		/// LEFT

		testRay.direction.set( -1, 0, 0 );

		let rayCollision = atlas.intersectRay( testRay, stages, false );

		let intersectionLeft = rayCollision.points ?
											rayCollision.points[ 0 ].x :
											false ;

		/// RIGHT

		testRay.direction.set( 1, 0, 0 );

		rayCollision = atlas.intersectRay( testRay, stages, false );

		let intersectionRight = rayCollision.points ?
											rayCollision.points[ 0 ].x :
											false ;

		/////////////////////////
		/// ANGLE OF CAMERA RAY
		/////////////////////////

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

		// constraint to MAX_YAW
		angle = (angle * MAX_YAW) / (Math.PI / 2);

		///////////////////////////
		/// INTERSECT CAMERA RAY
		///////////////////////////

		// The computed angle is applied to the ray we use
		// to position the camera

		cameraRay.origin.copy( cameraTarget );
		cameraRay.direction.copy( CAMERA_DIRECTION );

		cameraRay.direction.applyAxisAngle(
			cameraRayAxis,
			-angle
		);

		/// CAMERA DISTANCE

		// scene graph stages to check for collision with camera ray
		stages = [
			Math.floor( player.position.y ),
			Math.floor( player.position.y ) +1,
			Math.floor( player.position.y ) +2,
			Math.floor( player.position.y ) +3
		];

		rayCollision = atlas.intersectRay( cameraRay, stages, true );

		if ( rayCollision ) {

			// We want to camera to be positioned at the intersection
			// between the ray and the obstacle
			var distCamera = rayCollision.points[ 0 ].distanceTo( cameraRay.origin ) - 0.05;

			if ( distCamera > DEFAULT_CAMERA_DISTANCE ) {

				distCamera = DEFAULT_CAMERA_DISTANCE ;

			};

		} else {

			var distCamera = DEFAULT_CAMERA_DISTANCE ;

		};

		// Set the vector cameraWantedPos at the computed point
		cameraRay.at( distCamera, cameraWantedPos );

		// Check if wanted position is too close from player,
		// if yes, then make it higher

		if ( distCamera < MIN_CAMERA_DISTANCE ) {

			testRay.origin.copy( cameraWantedPos );
			testRay.direction.set( 0, 1, 0 );

			stages = [
				Math.floor( cameraWantedPos.y ),
				Math.floor( cameraWantedPos.y ) +1,
				Math.floor( cameraWantedPos.y ) +2
			];

			let rayCollision = atlas.intersectRay( testRay, stages, true );

			if ( !rayCollision.points ||
				 !( rayCollision.points[ 0 ].distanceTo( cameraWantedPos ) < ( CAMERA_WIDTH / 2 ) ) ) {

				let height = Math.sqrt( Math.pow( MIN_CAMERA_DISTANCE, 2 ) - Math.pow( distCamera, 2 ) );

				cameraWantedPos.y += height ;

			};

		};

		//////////////////
		/// CAMERA PATH
		//////////////////

		stages = [
			Math.floor( camera.position.y ),
			Math.floor( camera.position.y ) +1,
			Math.floor( camera.position.y ) -1,
		];

		testRay.origin.copy( camera.position );

		testRay.direction.copy( cameraWantedPos )
						 .sub( camera.position )
						 .normalize();

		// We check if intersection between camera and cameraWantedPos
		rayCollision = atlas.intersectRay( testRay, stages, true );

		// If there is, we try to avoid the obstacle on the path
		if ( rayCollision &&
			 rayCollision.points[ 0 ].distanceTo( camera.position ) < cameraWantedPos.distanceTo( camera.position ) ) {

			if ( rayCollision.closestTile.isWall &&
				 rayCollision.closestTile.isXAligned ) {

				dodgeCamera( rayCollision, 'z', [

					{
						dist : rayCollision.points[ 0 ].y -
							  Math.min( rayCollision.closestTile.points[ 0 ].y,
									   rayCollision.closestTile.points[ 1 ].y ),
						pos : Math.min( rayCollision.closestTile.points[ 0 ].y,
									   rayCollision.closestTile.points[ 1 ].y ),
						dir : 'y',
						sign : -1
					},

					{
						dist : rayCollision.points[ 0 ].x -
							 Math.min( rayCollision.closestTile.points[ 0 ].x,
									   rayCollision.closestTile.points[ 1 ].x ),
						pos : Math.min( rayCollision.closestTile.points[ 0 ].x,
									   rayCollision.closestTile.points[ 1 ].x ),
						dir : 'x',
						sign : -1
					},

					{
						dist: rayCollision.points[ 0 ].y -
							 Math.max( rayCollision.closestTile.points[ 0 ].y,
									   rayCollision.closestTile.points[ 1 ].y ),
						pos: Math.max( rayCollision.closestTile.points[ 0 ].y,
									   rayCollision.closestTile.points[ 1 ].y ),
						dir : 'y',
						sign : 1
					},

					{
						dist : rayCollision.points[ 0 ].x -
							 Math.max( rayCollision.closestTile.points[ 0 ].x,
									   rayCollision.closestTile.points[ 1 ].x ),
						pos : Math.max( rayCollision.closestTile.points[ 0 ].x,
									   rayCollision.closestTile.points[ 1 ].x ),
						dir : 'x',
						sign : 1
					}

				]);


			} else if ( rayCollision.closestTile.isWall &&
						!rayCollision.closestTile.isXAligned ) {

				dodgeCamera( rayCollision, 'x', [

					{
						dist : rayCollision.points[ 0 ].y -
							  Math.min( rayCollision.closestTile.points[ 0 ].y,
									   rayCollision.closestTile.points[ 1 ].y ),
						pos : Math.min( rayCollision.closestTile.points[ 0 ].y,
									   rayCollision.closestTile.points[ 1 ].y ),
						dir : 'y',
						sign : -1
					},

					{
						dist : rayCollision.points[ 0 ].z -
							 Math.min( rayCollision.closestTile.points[ 0 ].z,
									   rayCollision.closestTile.points[ 1 ].z ),
						pos : Math.min( rayCollision.closestTile.points[ 0 ].z,
									   rayCollision.closestTile.points[ 1 ].z ),
						dir : 'z',
						sign : -1
					},

					{
						dist: rayCollision.points[ 0 ].y -
							 Math.max( rayCollision.closestTile.points[ 0 ].y,
									   rayCollision.closestTile.points[ 1 ].y ),
						pos: Math.max( rayCollision.closestTile.points[ 0 ].y,
									   rayCollision.closestTile.points[ 1 ].y ),
						dir : 'y',
						sign : 1
					},

					{
						dist : rayCollision.points[ 0 ].z -
							 Math.max( rayCollision.closestTile.points[ 0 ].z,
									   rayCollision.closestTile.points[ 1 ].z ),
						pos : Math.max( rayCollision.closestTile.points[ 0 ].z,
									   rayCollision.closestTile.points[ 1 ].z ),
						dir : 'z',
						sign : 1
					}

				]);

			};

		};
		
		//////////////////////
		///  POSITION CAMERA
		//////////////////////

		backupCameraPos.copy( camera.position );

		attemptCameraMove( 'x', delta );
		attemptCameraMove( 'y', delta );
		attemptCameraMove( 'z', delta );

		camera.lookAt( cameraTarget );

	};

	//

	function dodgeCamera( rayCollision, adjDir, edges ) {

		// 'edges' object contain the information about the edges of the tile
		// being an obstacle on the camera path. We will use it to move the
		// camera in the shortest escape path

		// Find the closest edge
		edges.sort( ( a, b )=> {

			return Math.abs( a.dist ) - Math.abs( b.dist );

		});

		// For each edge, we check if an adjacent tile exists.
		// If so, we try the next edge.
		// If not we move the camera in the wanted position.

		for ( edge of edges ) {

			if ( atlas.adjTileExists( rayCollision.closestTile, edge.dir, edge.sign ) ) {

				continue ;

			} else {

				// Align the camera on the same plane as the obstacle tile on the x axis
				camera.position[ adjDir ] = rayCollision.closestTile.points[ 0 ][ adjDir ] ;
				
				// push the camera on X or Y to avoid the obstacle tile
				camera.position[ edge.dir ] = edge.pos +
											  ( ( CAMERA_WIDTH / 2 ) * edge.sign ) +
											  ( 0.1 * edge.sign );

				break ;

			};

		};

	};

	//

	function attemptCameraMove( dir, delta ) {

		camera.position[ dir ] = utils.lerp( camera.position[ dir ], cameraWantedPos[ dir ], CAMERA_TWEENING_SPEED * delta );

		if ( atlas.collideCamera() ) {

			camera.position[ dir ] = backupCameraPos[ dir ];

		};

	};

	//

	function resetCameraPos() {

		camera.position.copy( CAMERA_DIRECTION );
		camera.position.multiplyScalar( DEFAULT_CAMERA_DISTANCE );
		camera.position.add( player.position );

	};

	//

	return {
		update,
		directionalLight,
		adaptFOV,
		CAMERA_WIDTH,
		resetCameraPos,
		hideLight,
		showLight
	};

};
