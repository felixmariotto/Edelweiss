
function Atlas() {

	var sceneGraph ;

	const PLAYERHEIGHT = 0.62 ;
	const PLAYERWIDTH = 0.3 ;

	const CUBEWIDTH = 0.4 ;
	const INTERACTIVECUBERANGE = 0.82 ; // radius

    const CUBE_INTERSECTION_OFFSET = 0.001 ;

	var startPos = new THREE.Vector3();

	var planes = [];

	var cameraCollision = false ;

	// This is used in cube collision to know which
	// direction is the one with less collision
	var collisionSortArr = [ 'x', 'y', 'z' ];

	//

	var cubeCollision = {
		point: undefined,
		inRange: undefined,
		tag: undefined
	};

	var yCollision = {
		point: undefined,
		direction: undefined,
		maxX: undefined,
		minX: undefined,
		maxZ: undefined,
		minZ: undefined
	};

	var xCollision = {
		maxHeight: undefined,
		minHeight: undefined,
		maxX: undefined,
		minX: undefined,
		maxZ: undefined,
		minZ: undefined,
		xPoint: undefined,
		zPoint: undefined,
		majorWallType: undefined
	};

	//

	var tempTriVec1 = new THREE.Vector3();
	var tempTriVec2 = new THREE.Vector3();
	var tempRayCollision = new THREE.Vector3();
	
	var rayCollision = {
		// We only need two points, because it's not relevant
		// to know if there is more than two intersection points
		points: [
			new THREE.Vector3(),
			new THREE.Vector3()
		],
		closestTile: undefined
	};

	// used for wall collision
	var checkDirection ;
	var collidedWalls = [];
	var majorWall;
	var shiftedPlayerPos = new THREE.Vector3();
	var tileCenter = new THREE.Vector3();
	var wallDistance;

    //////////////////////
    ///     INIT
    //////////////////////

    function init( obj ) {

    	sceneGraph = obj ;

    	// initialise the map
		initHelpers( 'init' );

    };

    //
	
	function initHelpers( gateName ) {

		for ( let tilesGraphStage of sceneGraph.tilesGraph ) {

			if ( tilesGraphStage ) for ( let logicTile of tilesGraphStage ) {

				if ( logicTile.type == 'ground-start' &&
					 gameState.respawnPos.length() == 0 ) {

					startPos.set(
						(logicTile.points[0].x + logicTile.points[1].x) / 2,
						(logicTile.points[0].y + logicTile.points[1].y) / 2,
						(logicTile.points[0].z + logicTile.points[1].z) / 2
					);

					gameState.respawnPos.set(
						(logicTile.points[0].x + logicTile.points[1].x) / 2,
						(logicTile.points[0].y + logicTile.points[1].y) / 2,
						(logicTile.points[0].z + logicTile.points[1].z) / 2
					);

				};

				if ( logicTile.tag && logicTile.tag == 'exit-' + gateName ) {

					gameState.gateTilePos.set(
						(logicTile.points[0].x + logicTile.points[1].x) / 2,
						(logicTile.points[0].y + logicTile.points[1].y) / 2,
						(logicTile.points[0].z + logicTile.points[1].z) / 2
					);

				};

			};

		};

		for ( let cubesGraphStage of sceneGraph.cubesGraph ) {

			if ( cubesGraphStage ) for ( let logicCube of cubesGraphStage ) {

				dynamicItems.addCube( logicCube );

			};

		};

		// Can remove conditional later
		if ( sceneGraph.planes ) {

			for ( let importedPlane of sceneGraph.planes ) {

				var plane = new THREE.Plane(
					new THREE.Vector3(
						importedPlane.norm.x,
						0,
						importedPlane.norm.z
					),
					importedPlane.const
				);

				planes.push( plane );

			};

		};

		if ( gateName == 'init' ) gameState.die();

	};

	//

	function deleteCubeFromGraph( logicCube ) {

		for ( let i of Object.keys( sceneGraph.cubesGraph ) ) {

			if ( sceneGraph.cubesGraph[i] ) {

				sceneGraph.cubesGraph[i].forEach( ( cube )=> {

					if ( cube == logicCube ) {

						sceneGraph.cubesGraph[i].splice(
							sceneGraph.cubesGraph[i].indexOf( cube ),
							1
						);

					};

				});

			};

		};

	};

	//////////////////
	// PLAYER LOGIC
	//////////////////

	var player = Player();

	controler = Controler( player );

	charaAnim = CharaAnim( player );

	cameraControl = CameraControl( player, camera );

	function Player() {

		let id = utils.randomString();

		let group = new THREE.Group();
		scene.add( group );

		let position = group.position ;

		group.position.copy( startPos );
	
		/// HELPER

			let box = new THREE.LineSegments( new THREE.EdgesGeometry(
				new THREE.BoxBufferGeometry(
					PLAYERWIDTH,
					PLAYERHEIGHT,
					PLAYERWIDTH
					) ),
				new THREE.LineBasicMaterial({
					transparent: true,
					opacity: 0.5
				})
			);
		
			group.add( box );
			box.position.y = PLAYERHEIGHT / 2 ;
			box.visible = false;

		/// CHARACTER

		let charaGroup = new THREE.Group();
		group.add( charaGroup );


			let arrow = new THREE.Mesh(
				new THREE.ConeBufferGeometry( 0.2, 0.4, 4, 1, true ),
				new THREE.MeshNormalMaterial({ wireframe: true })
			);

			charaGroup.add( arrow );
			arrow.rotation.x = Math.PI / 2 ;
			arrow.position.y = PLAYERHEIGHT / 2 ;
			arrow.visible = false;

		let { model, actions } = assetManager.createCharacter( utils.stringHash( id ) );
		charaGroup.add( model );

		return {
			id,
			actions,
			group,
			charaGroup,
			showHelpers: function() {
				box.visible = arrow.visible = true;
			},
			position
		};

	};

	/////////////////////////
	///    COLLISIONS
	/////////////////////////

	function collideCamera() {

		cameraCollision = false ;

		checkStage( Math.floor( camera.position.y ) );
		checkStage( Math.floor( camera.position.y ) + 1 );
		checkStage( Math.floor( camera.position.y ) -1 );

		return cameraCollision ;

		function checkStage( stage ) {

			if ( sceneGraph.tilesGraph[ stage ] ) {

				// loop through the group of tiles at the same height as the player
				sceneGraph.tilesGraph[ stage ].forEach( ( logicTile )=> {

					// AABB collision detection
					if ( !( Math.min( logicTile.points[0].x, logicTile.points[1].x ) > camera.position.x + ( cameraControl.CAMERA_WIDTH / 2 ) ||
							Math.max( logicTile.points[0].x, logicTile.points[1].x ) < camera.position.x - ( cameraControl.CAMERA_WIDTH / 2 ) ||
							Math.min( logicTile.points[0].y, logicTile.points[1].y ) > camera.position.y + ( cameraControl.CAMERA_WIDTH / 2 ) ||
							Math.max( logicTile.points[0].y, logicTile.points[1].y ) < camera.position.y - ( cameraControl.CAMERA_WIDTH / 2 ) ||
							Math.min( logicTile.points[0].z, logicTile.points[1].z ) > camera.position.z + ( cameraControl.CAMERA_WIDTH / 2 ) ||
							Math.max( logicTile.points[0].z, logicTile.points[1].z ) < camera.position.z - ( cameraControl.CAMERA_WIDTH / 2 )  ) ) {

						cameraCollision = true ;

					};

				});

			};

		};

	};

	//

	function collidePlayerCubes() {

		cubeCollision.point = undefined ;
		cubeCollision.inRange = undefined ;

		checkStage( Math.floor( player.position.y ) );
		checkStage( Math.floor( player.position.y ) + 1 );
		checkStage( Math.floor( player.position.y ) + 2 );
		checkStage( Math.floor( player.position.y ) + 3 );
		checkStage( Math.floor( player.position.y ) - 1 );
		checkStage( Math.floor( player.position.y ) - 2 );
		checkStage( Math.floor( player.position.y ) - 3 );
		checkInvisibleCubes();

		return cubeCollision

	};

	//

	function checkInvisibleCubes() {

		sceneGraph.cubesGraph.forEach( (stage)=> {

			if ( !stage ) return

			stage.forEach( (logicCube)=> {

				if ( logicCube.type == 'cube-trigger-invisible' ) {

					

					if ( cubeCollides( logicCube ) ) {

						soundMixer.setMusic( logicCube.tag );

					};

				};

			});

		});

	};

	//

	function checkStage( stage ) {

		if ( sceneGraph.cubesGraph[ stage ] ) {

			// loop through the group of tiles at the same height as the player
			sceneGraph.cubesGraph[ stage ].forEach( (logicCube, i)=> {


				///////////////////////////////
				///  INTERACTIVE CUBE RANGE
				///////////////////////////////

				if ( logicCube.type == 'cube-interactive' ) {
					
					if ( utils.distanceVecs( logicCube.position, player.position ) < INTERACTIVECUBERANGE ) {

						cubeCollision.inRange = true ;
						cubeCollision.tag = logicCube.tag ;

					};

				};

				/////////////////////////
				//	GENERAL COLLISION
				/////////////////////////

				// check for X Z collision
				if ( cubeCollides( logicCube ) ) {

					if ( logicCube.type != 'cube-trigger' &&
						 logicCube.type != 'cube-trigger-invisible' &&
						 logicCube.type != 'cube-anchor' ) {

						///////////////////////////////////////////////////////
						// Set cubeCollision.point from the cube coordinates
						///////////////////////////////////////////

						cubeCollision.point = {};

						// X DIR
						if ( logicCube.position.x > player.position.x ) {
							cubeCollision.point.x = Math.min( player.position.x, logicCube.position.x - ( (CUBEWIDTH * logicCube.scale.x ) / 2 ) - (PLAYERWIDTH / 2) - CUBE_INTERSECTION_OFFSET );
						} else {
							cubeCollision.point.x = Math.max( player.position.x, logicCube.position.x + ( (CUBEWIDTH * logicCube.scale.x ) / 2 ) + (PLAYERWIDTH / 2) + CUBE_INTERSECTION_OFFSET );
						};

						// Z DIR
						if ( logicCube.position.z > player.position.z ) {
							cubeCollision.point.z = Math.min( player.position.z, logicCube.position.z - ( (CUBEWIDTH * logicCube.scale.z ) / 2 ) - (PLAYERWIDTH / 2) - CUBE_INTERSECTION_OFFSET );
						} else {
							cubeCollision.point.z = Math.max( player.position.z, logicCube.position.z + ( (CUBEWIDTH * logicCube.scale.z ) / 2 ) + (PLAYERWIDTH / 2) + CUBE_INTERSECTION_OFFSET );
						};

						// Y DIR
						if ( logicCube.position.y > player.position.y + ( PLAYERHEIGHT / 2 ) ) {
							cubeCollision.point.y = Math.min( player.position.y, logicCube.position.y - ( (CUBEWIDTH * logicCube.scale.y ) / 2 ) - PLAYERHEIGHT - CUBE_INTERSECTION_OFFSET );
						} else {
							cubeCollision.point.y = Math.max( player.position.y, logicCube.position.y + ( (CUBEWIDTH * logicCube.scale.y ) / 2 ) + CUBE_INTERSECTION_OFFSET );
						};


						/// All this mess is to get cubeCollision.point value which
						// is the closest from player.position values, then clamp
						// the other two to player.position values.

						collisionSortArr.sort( (a, b)=> {

							return Math.abs( cubeCollision.point[a] - player.position[a] ) -
								   Math.abs( cubeCollision.point[b] - player.position[b] )

						});

						cubeCollision.point[ collisionSortArr[1] ] = player.position[ collisionSortArr[1] ] ;
						cubeCollision.point[ collisionSortArr[2] ] = player.position[ collisionSortArr[2] ] ;

					} else if ( logicCube.type == 'cube-trigger' ) {

						interaction.trigger( logicCube.tag );

					};

				};

			});

		};

	};

	//

	function cubeCollides( logicCube ) {

		return !( logicCube.position.x - ( (CUBEWIDTH * logicCube.scale.x ) / 2) > ( player.position.x + ( PLAYERWIDTH / 2 ) ) ||
				  logicCube.position.z - ( (CUBEWIDTH * logicCube.scale.z ) / 2) > ( player.position.z + ( PLAYERWIDTH / 2 ) ) ||
				  logicCube.position.x + ( (CUBEWIDTH * logicCube.scale.x ) / 2) < ( player.position.x - ( PLAYERWIDTH / 2 ) ) ||
				  logicCube.position.z + ( (CUBEWIDTH * logicCube.scale.z ) / 2) < ( player.position.z - ( PLAYERWIDTH / 2 ) ) ||
				  logicCube.position.y - ( (CUBEWIDTH * logicCube.scale.y ) / 2) > ( player.position.y + PLAYERHEIGHT ) ||
				  logicCube.position.y + ( (CUBEWIDTH * logicCube.scale.y ) / 2) < player.position.y )

	};

	//

	function collidePlayerGrounds() {

		yCollision.point = undefined ;
		yCollision.direction = undefined ;
		yCollision.maxX = undefined ;
		yCollision.minX = undefined ;
		yCollision.maxZ = undefined ;
		yCollision.minZ = undefined ;

		// We check only the tiles at the same height as the player
		checkStage( Math.floor( player.position.y ) );
		checkStage( Math.floor( player.position.y ) + 1 );
		checkStage( Math.floor( player.position.y ) - 1 );


		function checkStage( stage ) {


			if ( sceneGraph.tilesGraph[ stage ] ) {


				// loop through the group of tiles at the same height as the player
				sceneGraph.tilesGraph[ stage ].forEach( (logicTile, i)=> {


					if ( !logicTile.isWall ) {


						// check for X Z collision
						if ( !( Math.min( logicTile.points[0].x, logicTile.points[1].x ) > ( player.position.x + ( PLAYERWIDTH / 2 ) - 0.12 ) ||
								Math.min( logicTile.points[0].z, logicTile.points[1].z ) > ( player.position.z + ( PLAYERWIDTH / 2 ) - 0.12 ) ||
								Math.max( logicTile.points[0].x, logicTile.points[1].x ) < ( player.position.x - ( PLAYERWIDTH / 2 ) + 0.12 ) ||
								Math.max( logicTile.points[0].z, logicTile.points[1].z ) < ( player.position.z - ( PLAYERWIDTH / 2 ) + 0.12 )  ) ) {


							// check for down collision
							if ( player.position.y <= logicTile.points[0].y &&
								 logicTile.points[0].y <= player.position.y + (PLAYERHEIGHT / 2) ) {

								// return the position of the player on the ground
								yCollision.point = logicTile.points[0].y ;
								yCollision.direction = 'down' ;

								computeMaxMin()
							};


							// check for up collision
							if ( player.position.y + PLAYERHEIGHT >= logicTile.points[0].y &&
								 player.position.y + (PLAYERHEIGHT / 2) <= logicTile.points[0].y ) {

								// return the position of the player after hitting the roof
								yCollision.point = logicTile.points[0].y - PLAYERHEIGHT ;
								yCollision.direction = 'up' ;

								computeMaxMin()
							};


							// Compute max and min values
							function computeMaxMin() {

								///////////
								//  X DIR
								///////////

								if ( typeof yCollision.maxX != 'undefined' ) {
									if ( yCollision.maxX < Math.max( logicTile.points[0].x, logicTile.points[1].x ) ) {
										yCollision.maxX = Math.max( logicTile.points[0].x, logicTile.points[1].x );
									};
								} else {
									yCollision.maxX = Math.max( logicTile.points[0].x, logicTile.points[1].x );
								};

								if ( typeof yCollision.minX != 'undefined' ) {
									if ( yCollision.minX > Math.min( logicTile.points[0].x, logicTile.points[1].x ) ) {
										yCollision.minX = Math.min( logicTile.points[0].x, logicTile.points[1].x );
									};
								} else {
									yCollision.minX = Math.min( logicTile.points[0].x, logicTile.points[1].x );
								};


								///////////
								//  Z DIR
								///////////

								if ( typeof yCollision.maxZ != 'undefined' ) {
									if ( yCollision.maxZ < Math.max( logicTile.points[0].z, logicTile.points[1].z ) ) {
										yCollision.maxZ = Math.max( logicTile.points[0].z, logicTile.points[1].z );
									};
								} else {
									yCollision.maxZ = Math.max( logicTile.points[0].z, logicTile.points[1].z );
								};

								if ( typeof yCollision.minZ != 'undefined' ) {
									if ( yCollision.minZ > Math.min( logicTile.points[0].z, logicTile.points[1].z ) ) {
										yCollision.minZ = Math.min( logicTile.points[0].z, logicTile.points[1].z );
									};
								} else {
									yCollision.minZ = Math.min( logicTile.points[0].z, logicTile.points[1].z );
								};

							};

						};

					};

				});
	
			};
			
		};

		return yCollision;
	};

	//

	function collidePlayerWalls( direction ) {

		xCollision.maxHeight = undefined ;
		xCollision.minHeight = undefined ;
		xCollision.maxX = undefined ;
		xCollision.minX = undefined ;
		xCollision.maxZ = undefined ;
		xCollision.minZ = undefined ;
		xCollision.xPoint = undefined ;
		xCollision.zPoint = undefined ;
		xCollision.majorWallType = undefined ;
		xCollision.direction = undefined ;

		collidedWalls = [];

		// We check only the tiles at the same height as the player
		checkStage( Math.floor( player.position.y ) );
		checkStage( Math.floor( player.position.y ) + 1 );
		checkStage( Math.floor( player.position.y ) - 1 );

		checkPlanes();

		if ( collidedWalls.length == 1 ) {

			// Set xCollision according to the only wall collided
			xCollision.majorWallType = collidedWalls[0].type ;

			// compute direction of the tile compared to player's position
			computeDirection( collidedWalls[0] );

		} else if ( collidedWalls.length > 1 ) {

			// compute shifted player position on shiftedPlayerPos
			shiftedPlayerPos.copy( player.position );
			shiftedPlayerPos.y += PLAYERHEIGHT / 2 ;

			// get the major wall collided
			majorWall = collidedWalls.reduce( (array, wall)=> {

				// compute tile's center on tileCenter
				tileCenter.x = (wall.points[0].x + wall.points[1].x) / 2 ;
				tileCenter.y = (wall.points[0].y + wall.points[1].y) / 2 ;
				tileCenter.z = (wall.points[0].z + wall.points[1].z) / 2 ;

				// get distance between shiftedPlayerPos and tileCenter
				wallDistance = shiftedPlayerPos.distanceTo( tileCenter );

				// if shortest distance, put this wall in accu
				if ( array[1] > wallDistance ) {

					array[0] = wall ;
					array[1] = wallDistance ;
				};
				
				return array ;

			}, [ undefined, 1000 /* var to compare distance */ ] )[0];

			xCollision.majorWallType = majorWall.type ;

			// compute direction of the tile compared to player's position
			computeDirection( majorWall );

		};

		return xCollision ;

		// This function check for collision with the scene's limit planes
		function checkPlanes() {

			planes.forEach( (plane)=> {

				// Plane is parallel to camera
				if ( plane.normal.z != 0 ) {

					let limit = plane.normal.z * (plane.constant * -1);

					if ( player.position.z + (atlas.PLAYERWIDTH / 2) > limit &&
						 player.position.z - (atlas.PLAYERWIDTH / 2) < limit ) {


						if ( direction > -Math.PI / 2 &&
							 direction < Math.PI / 2 ) {

							xCollision.zPoint = plane.constant - (atlas.PLAYERWIDTH / 2) ;

						} else {

							xCollision.zPoint = - plane.constant + (atlas.PLAYERWIDTH / 2) ;

						};
						
					};

				// plane is right or left
				} else {

					let limit = plane.normal.x * (plane.constant * -1);

					if ( player.position.x + (atlas.PLAYERWIDTH / 2) > limit &&
						 player.position.x - (atlas.PLAYERWIDTH / 2) < limit ) {

						if ( direction > 0 ) {

							xCollision.xPoint = plane.constant - (atlas.PLAYERWIDTH / 2) ;

						} else {

							xCollision.xPoint = - plane.constant + (atlas.PLAYERWIDTH / 2) ;

						};

					};

				};

			});

		};

		// Check for collistion with the player at one given stage
		function checkStage( stage ) {

			if ( sceneGraph.tilesGraph[ stage ] ) {

				// loop through the group of tiles at the same height as the player
				sceneGraph.tilesGraph[ stage ].forEach( (logicTile, i)=> {

					// Check that the tile is not a ground,
					// and check that the wall is at an interacting height with the player
					if ( logicTile.isWall &&
						 // Is bottom limit of player intersecting with tile ?
						 ( Math.min( logicTile.points[0].y, logicTile.points[1].y ) <= player.position.y + 0.1 && 
						   Math.max( logicTile.points[0].y, logicTile.points[1].y ) >= player.position.y + 0.1 )  ||
						 // Is top limit of player intersecting with tile ?
						 ( Math.min( logicTile.points[0].y, logicTile.points[1].y ) <= player.position.y + PLAYERHEIGHT - 0.1 && 
						   Math.max( logicTile.points[0].y, logicTile.points[1].y ) >= player.position.y + PLAYERHEIGHT - 0.1 )  ) {

						// Save the colliding tile into the array that is used to know
						// the major wall type, and compute the max and min wall limits
						// min and high limits are used for slipping, hauling.. etc..
						function recordCollision( direction ) {

							collidedWalls.push( logicTile );

							// Y DIR

							if ( typeof xCollision.maxHeight != 'undefined' ) {
								if ( xCollision.maxHeight < Math.max( logicTile.points[0].y, logicTile.points[1].y ) ) {
									xCollision.maxHeight = Math.max( logicTile.points[0].y, logicTile.points[1].y );
								};
							} else {
								xCollision.maxHeight = Math.max( logicTile.points[0].y, logicTile.points[1].y );
							};

							if ( typeof xCollision.minHeight != 'undefined' ) {
								if ( xCollision.minHeight > Math.min( logicTile.points[0].y, logicTile.points[1].y ) ) {
									xCollision.minHeight = Math.min( logicTile.points[0].y, logicTile.points[1].y );
								};
							} else {
								xCollision.minHeight = Math.min( logicTile.points[0].y, logicTile.points[1].y );
							};

							// X DIR

							if ( direction == 'x' ) {

								if ( typeof xCollision.maxX != 'undefined' ) {
									if ( xCollision.maxX < Math.max( logicTile.points[0].x, logicTile.points[1].x ) ) {
										xCollision.maxX = Math.max( logicTile.points[0].x, logicTile.points[1].x );
									};
								} else {
									xCollision.maxX = Math.max( logicTile.points[0].x, logicTile.points[1].x );
								};

								if ( typeof xCollision.minX != 'undefined' ) {
									if ( xCollision.minX > Math.min( logicTile.points[0].x, logicTile.points[1].x ) ) {
										xCollision.minX = Math.min( logicTile.points[0].x, logicTile.points[1].x );
									};
								} else {
									xCollision.minX = Math.min( logicTile.points[0].x, logicTile.points[1].x );
								};

							};

							// Z DIR

							if ( direction == 'z' ) {

								if ( typeof xCollision.maxZ != 'undefined' ) {
									if ( xCollision.maxZ < Math.max( logicTile.points[0].z, logicTile.points[1].z ) ) {
										xCollision.maxZ = Math.max( logicTile.points[0].z, logicTile.points[1].z );
									};
								} else {
									xCollision.maxZ = Math.max( logicTile.points[0].z, logicTile.points[1].z );
								};

								if ( typeof xCollision.minZ != 'undefined' ) {
									if ( xCollision.minZ > Math.min( logicTile.points[0].z, logicTile.points[1].z ) ) {
										xCollision.minZ = Math.min( logicTile.points[0].z, logicTile.points[1].z );
									};
								} else {
									xCollision.minZ = Math.min( logicTile.points[0].z, logicTile.points[1].z );
								};

							};

						};

						// Check if any X Z collision

						if ( logicTile.isXAligned &&
							 !( Math.min( logicTile.points[0].x, logicTile.points[1].x ) > ( player.position.x + ( PLAYERWIDTH / 2 ) - 0.05 ) ||
							 Math.max( logicTile.points[0].x, logicTile.points[1].x ) < ( player.position.x - ( PLAYERWIDTH / 2 ) + 0.05 ) ||
							 logicTile.points[0].z < ( player.position.z - ( PLAYERWIDTH / 2 ) ) ||
							 logicTile.points[0].z > ( player.position.z + ( PLAYERWIDTH / 2 ) ) ) ) {

							if ( logicTile.points[0].z > player.position.z ) {

								xCollision.zPoint = logicTile.points[0].z - (PLAYERWIDTH / 2) ;

							} else {

								xCollision.zPoint = logicTile.points[0].z + (PLAYERWIDTH / 2) ;

							};

							recordCollision( 'x' );

						} else if ( !logicTile.isXAligned &&
									 !( Math.min( logicTile.points[0].z, logicTile.points[1].z ) > ( player.position.z + ( PLAYERWIDTH / 2 ) - 0.05 ) ||
									 Math.max( logicTile.points[0].z, logicTile.points[1].z ) < ( player.position.z - ( PLAYERWIDTH / 2 ) + 0.05 ) ||
									 logicTile.points[0].x < ( player.position.x - ( PLAYERWIDTH / 2 ) ) ||
									 logicTile.points[0].x > ( player.position.x + ( PLAYERWIDTH / 2 ) ) ) ) {

							if ( logicTile.points[0].x > player.position.x ) {

								xCollision.xPoint = logicTile.points[0].x - (PLAYERWIDTH / 2) ;

							} else {

								xCollision.xPoint = logicTile.points[0].x + (PLAYERWIDTH / 2) ;

							};

							recordCollision( 'z' );

						};

					};

				});

			};

		};

		//

		function computeDirection( logicTile ) {

			if ( logicTile.isXAligned ) {

				xCollision.direction = logicTile.points[0].z > player.position.z ? 'down' : 'up' ;

			} else {

				xCollision.direction = logicTile.points[0].x > player.position.x ? 'right' : 'left' ;

			};

		};

	};

	//

	function intersectRay( ray, stages, mustTestGrounds ) {

		rayCollision.points[ 0 ].set( 0, 0, 0 ) ;
		rayCollision.points[ 1 ].set( 0, 0, 0 ) ;
		rayCollision.closestTile = undefined ;

		stages.forEach( ( id )=> {
			checkStage( id );
		});

		return rayCollision.points[ 0 ].length() > 0 ? rayCollision : false ;

		function checkStage( stage ) {

			if ( sceneGraph.tilesGraph[ stage ] ) {

				sceneGraph.tilesGraph[ stage ].forEach( (logicTile, i)=> {

					// does not test grounds if not asked for in argument
					if ( !mustTestGrounds && logicTile.isWall ||
						 mustTestGrounds ) {

						// Depending on the tile's direction, we create temporary vectors
						// for the ray intersection with a triangle
						if ( logicTile.isWall ) {

							if ( logicTile.isXAligned ) {

								tempTriVec1.set( logicTile.points[0].x, logicTile.points[1].y, logicTile.points[0].z );
								tempTriVec2.set( logicTile.points[1].x, logicTile.points[0].y, logicTile.points[0].z );
								
							} else {

								tempTriVec1.set( logicTile.points[0].x, logicTile.points[1].y, logicTile.points[0].z );
								tempTriVec2.set( logicTile.points[0].x, logicTile.points[0].y, logicTile.points[1].z );

							};

						} else {

							tempTriVec1.set( logicTile.points[0].x, logicTile.points[0].y, logicTile.points[1].z );
							tempTriVec2.set( logicTile.points[1].x, logicTile.points[0].y, logicTile.points[0].z );

						};

						// Intersection check with the two triangles formed by the tile

						logicTile.points.forEach( (baseVec)=> {

							tempRayCollision.set( 0, 0, 0 );

							ray.intersectTriangle(
								tempTriVec1,
								tempTriVec2,
								baseVec,
								false,
								tempRayCollision
							);

							if ( tempRayCollision.length() > 0 ) {

								// Here we check if the collision point found is closer than
								// the two we already have, and if so, we position it accordingly
								// in the array

								if ( tempCollisionShorterThan( rayCollision.points[ 0 ] ) ) {

									rayCollision.points[ 1 ].copy( rayCollision.points[ 0 ] );
									rayCollision.points[ 0 ].copy( tempRayCollision );

									rayCollision.closestTile = logicTile ;

								} else if ( tempCollisionShorterThan( rayCollision.points[ 1 ] ) ) {

									rayCollision.points[ 1 ].copy( tempRayCollision );

								};

								function tempCollisionShorterThan( collisionVec ) {

									if ( collisionVec.length() == 0 ) return true ;

									if ( tempRayCollision.distanceTo( ray.origin ) <
										 collisionVec.distanceTo( ray.origin ) ) {

										return true ;

									} else {

										return false ;

									};

								};

							};

						});

					};

				});

			};

		};

	};

	/////////////////////////
	///    FUNCTIONS
	/////////////////////////

	// transform [{x:0, y:1}, {x:1, y:0}] into [{x:1, y:1}, {x:0, y:0}],
	// which is the same for the collision system, but might be needed for
	// tiles equality check

	function toggleTile( tile ) {

		const newVecs = [];
		
		for ( let dir of Object.keys( tile[ 0 ] ) ) {
			
			if ( tile[ 0 ][ dir ] !== tile[ 1 ][ dir ] ) {

				// copy first vector
				const newVec = {
					x: tile[0].x,
					y: tile[0].y,
					z: tile[0].z
				};

				newVec[ dir ] = tile[ 1 ][ dir ];

				newVecs.push( newVec );

			};

		};

		tile[ 0 ].copy( newVecs[ 0 ] );
		tile[ 1 ].copy( newVecs[ 1 ] );

	};

	// adjTileExists is used by cameraControl to know if the tile
	// obstructing the camera path has an adjacent tile in the
	// specified direction.

	var testTileVecs = [
		new THREE.Vector3(),
		new THREE.Vector3()
	];

	function adjTileExists( testTile, dir, sign ) {

		let exists = false ;

		// create the vectors of the hypotetic tile

		testTileVecs[ 0 ].copy( testTile.points[ 0 ] );
		testTileVecs[ 1 ].copy( testTile.points[ 1 ] );

		testTileVecs[ 0 ][ dir ] += sign ;
		testTileVecs[ 1 ][ dir ] += sign ;

		// test each tile of this tilesGraph stage for equality

		if ( !sceneGraph.tilesGraph[ Math.min( testTileVecs[0].y, testTileVecs[1].y ) ] ) return ;

		sceneGraph.tilesGraph[ Math.min( testTileVecs[0].y, testTileVecs[1].y ) ].forEach( (logicTile)=> {

			if ( (utils.vecEquals( testTileVecs[0], logicTile.points[0] ) && utils.vecEquals( testTileVecs[1], logicTile.points[1] ) ) ||
				 (utils.vecEquals( testTileVecs[1], logicTile.points[0] ) && utils.vecEquals( testTileVecs[0], logicTile.points[1] ) ) ) {

				exists = true ;

			};

		});

		// We do the same here with the other possible set of points
		// for the hypothetic tile.

		if ( !exists ) {

			toggleTile( testTileVecs );

			sceneGraph.tilesGraph[ Math.min( testTileVecs[0].y, testTileVecs[1].y ) ].forEach( (logicTile)=> {

				if ( (utils.vecEquals( testTileVecs[0], logicTile.points[0] ) && utils.vecEquals( testTileVecs[1], logicTile.points[1] ) ) ||
					 (utils.vecEquals( testTileVecs[1], logicTile.points[0] ) && utils.vecEquals( testTileVecs[0], logicTile.points[1] ) ) ) {

					exists = true ;

				};

			});

		};

		return exists ;

	};

	//

	function switchGraph( graphName, gateName, respawn ) {

		sceneGraph = gameState.sceneGraphs[ graphName ];

		// hide/show the relevant assets according to the next map
		assetManager.updateGraph( graphName );

		soundMixer.switchGraph( graphName );

		mapManager.switchMap( graphName ).then( ()=> {

			planes = [];

			initHelpers( gateName );

			if ( respawn ) {

				respawn();

			} else {

				gameState.endPassGateAnim();

			};

		});

	};

	//

	function getSceneGraph() {
		return sceneGraph ;
	};

	//

	function openPropertiesDialog( node, types ) {
		const select = document.querySelector( '#properties select' );
		select.innerHTML = types.map( function( type ) {
			return '<option value="' + type + '"' + (( type === node.type ) ? ' selected' : '') + '>' + type + '</option>';
		}).join( '' );
		select.onchange = function() {
			node.type = select.value;
		};

		const input = document.querySelector( '#properties input' );
		input.value = node.tag || '';
		input.onchange = function() {
			if (input.value) {
				node.tag = input.value;
			} else {
				delete node.tag;
			}
		};

		document.getElementById( 'properties' ).style.display = 'block';
	};

	//

	function closePropertiesDialog() {
		document.getElementById( 'properties' ).style.display = 'none';
	};

	//

	var helpers, tileGizmo, transformControls, raycaster, shouldRaycast;

	function makeTileGizmo() {
		const gizmoTexture = (new THREE.TextureLoader).load( 'assets/tile-gizmo.png' );

		gizmoTexture.anisotropy = ( renderer.capabilities.getMaxAnisotropy() >> 1 );
		gizmoTexture.magFilter = THREE.NearestFilter;

		const gizmo = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ), new THREE.MeshBasicMaterial( {
			map: gizmoTexture, side: THREE.DoubleSide, transparent: true, depthTest: false
		} ) );

		gizmo.attach = function( object ) {
			this.position.copy( object.position );
			this.rotation.copy( object.rotation );
			this.object = object;
			this.visible = true;

			// with the code above tile gizmo ends up behind tile planes with depthTest already set to false, so...
			this.position.multiplyScalar( 1 - 0.01 ).addScaledVector( camera.position, 0.01 );
		};

		gizmo.detach = function() {
			this.object = undefined;
			this.visible = false;
		};
		gizmo.detach();

		return gizmo;
	};

	//

	function debug() {

		if ( !helpers ) {

			scene.add( helpers = new THREE.Group() );
			scene.add( tileGizmo = makeTileGizmo() );
			scene.add( transformControls = new THREE.TransformControls( camera, renderer.domElement ) );

			transformControls.addEventListener( 'change', function() {
				var mesh = transformControls.object;
				if( mesh ) {
					// block the raycast to let the cube transform finish
					shouldRaycast = false;

					var logicCube = mesh.userData.cube;
					if( logicCube ) {

						logicCube.position.x = (( mesh.position.x *100)|0)/100 ;
						logicCube.position.y = (( mesh.position.y *100)|0)/100 ;
						logicCube.position.z = (( mesh.position.z *100)|0)/100 ;

						logicCube.scale.x = (( mesh.scale.x *100)|0)/100 ;
						logicCube.scale.y = (( mesh.scale.y *100)|0)/100 ;
						logicCube.scale.z = (( mesh.scale.z *100)|0)/100 ;
					}
				}
			} );

			renderer.domElement.addEventListener( 'mousedown', function() {
				shouldRaycast = true;
			} );

			raycaster = new THREE.Raycaster();
			renderer.domElement.addEventListener( 'click', function( event ) {
				if( shouldRaycast ) {
					raycaster.setFromCamera( {
						x: ( event.layerX / renderer.domElement.offsetWidth ) * 2 - 1,
						y: ( event.layerY / renderer.domElement.offsetHeight ) * -2 + 1
					}, camera );

					var intersections = raycaster.intersectObject( helpers, true );
					if( intersections.length ) {
						var mesh = intersections[0].object;
						if( mesh.name == 'cube' ) {
							tileGizmo.detach();

							if( transformControls.object == mesh ) {
								transformControls.detach();
							} else {
								transformControls.attach( mesh );
							}
						} else {
							transformControls.detach();

							if( mesh.name == 'tile' ) {
								if( tileGizmo.object == mesh ) {
									tileGizmo.detach();
								} else {
									tileGizmo.attach( mesh );
								}
							}
						}
					} else {
						tileGizmo.detach();
						transformControls.detach();
					}

					closePropertiesDialog();
				}
			} );


			const tileGeometry = new THREE.PlaneBufferGeometry( 1, 1 );
			const tileTexture = (new THREE.TextureLoader).load( 'assets/matrix.gif' );

			tileTexture.anisotropy = ( renderer.capabilities.getMaxAnisotropy() >> 1 );

			for( let i = 0; i < 20; i++ ) {
				let mesh = new THREE.Mesh( tileGeometry, new THREE.ShaderMaterial( {
					vertexShader : `
						varying vec2 textureCoordinates;
						void main () {
							textureCoordinates = uv;
							gl_Position = projectionMatrix * modelViewMatrix * vec4 (position, 1.0);
						}
					`,
					fragmentShader : `
						uniform vec3 color;
						uniform sampler2D textureMap;
						varying vec2 textureCoordinates;
						void main () {
							float t = texture2D (textureMap, textureCoordinates).g;
							gl_FragColor = vec4( color * 2.0 * t, t );
						}
					`,
					uniforms: {
						textureMap: { value: tileTexture },
						color: { value: new THREE.Color( 0xff66 ) }
					},
					side: THREE.DoubleSide,
					transparent: true,
					depthTest: false
				} ) );

				mesh.name = 'tile' ;
				helpers.add( mesh );
			}


			const cubeGeometry = new THREE.BoxBufferGeometry( CUBEWIDTH, CUBEWIDTH, CUBEWIDTH );
			const edgeGeometry = new THREE.EdgesGeometry( cubeGeometry );

			for( let i = 0; i < 10; i++ ) {
				let mesh = new THREE.Mesh( cubeGeometry, new THREE.MeshLambertMaterial( {
					transparent: true
				} ) );

				mesh.name = 'cube' ;
				helpers.add( mesh );

				let box = new THREE.LineSegments( edgeGeometry, new THREE.LineBasicMaterial( {
					transparent: true,
					depthTest: false,
					opacity: 0.5
				} ) );

				box.raycast = function() {};
				mesh.add( box );
			}


			controler.permission.gliding = true ;
			controler.permission.airborne = true ;


			document.getElementById( 'gui' ).style.display = 'block';


			document.getElementById( 'tile-properties' ).onclick = function() {
				if( tileGizmo.object && tileGizmo.object.userData.tile ) {
					openPropertiesDialog( tileGizmo.object.userData.tile, [
						'ground-basic', 'ground-special', 'ground-start',
						'wall-limit', 'wall-slip', 'wall-easy', 'wall-medium', 'wall-hard', 'wall-fall'
					] );
				}
			};

			document.getElementById( 'cube-add' ).onclick = function() {
				var d = Math.sqrt( 0.5 ) * ( CUBEWIDTH + PLAYERWIDTH + CUBE_INTERSECTION_OFFSET );
				var dz = d * Math.cos( charaAnim.group.rotation.y );
				var dx = d * Math.sin( charaAnim.group.rotation.y );

				var logicCube = {
					position: {
						x: player.position.x + dx,
						y: player.position.y + 0.5 * CUBEWIDTH,
						z: player.position.z + dz
					},
					scale: { x: 1, y: 1, z: 1 },
					type: 'cube-inert'
				};

				var stage = Math.floor( logicCube.position.y );
				sceneGraph.cubesGraph[ stage ].push( logicCube );
				debugUpdate( true, logicCube );
			};

			document.getElementById( 'cube-remove' ).onclick = function() {
				if( transformControls.object && transformControls.object.userData.cube ) {
					deleteCubeFromGraph( transformControls.object.userData.cube );
					debugUpdate( true );
				}
			};

			document.getElementById( 'cube-properties' ).onclick = function() {
				if( transformControls.object && transformControls.object.userData.cube ) {
					openPropertiesDialog( transformControls.object.userData.cube, [
						'cube-inert', 'cube-interactive', 'cube-trigger', 'cube-trigger-invisible', 'cube-anchor'
					] );
				}
			};

			document.getElementById( 'cube-transform' ).onclick = function() {
				if ( transformControls.mode != 'scale' ) {
					transformControls.setMode( 'scale' );
				} else {
					transformControls.setMode( 'translate' );
				}
			};

			document.getElementById( 'teleport' ).onclick = function() {
				const selects = document.querySelectorAll( '#destinations select' );

				// special places to go to

				const places = [];
				for ( let stage in sceneGraph.tilesGraph ) if ( sceneGraph.tilesGraph[ stage ] )
				for ( let logicTile of sceneGraph.tilesGraph[ stage ] ) if ( /ground-s/.test( logicTile.type ) ) {
					places.push( {
						name: logicTile.tag || '(no tag)',
						coordinates: JSON.stringify( {
							x: ( logicTile.points[0].x + logicTile.points[1].x ) / 2,
							y: ( logicTile.points[0].y + logicTile.points[1].y ) / 2,
							z: ( logicTile.points[0].z + logicTile.points[1].z ) / 2
						} )
					} );
				}
				places.sort( function( a, b ) { return (( a.name > b.name ) || (
					// try to make the sorting order prettier with some simple hack like...
					( a.name.length > b.name.length ) && ( a.name.charAt( 0 ) == b.name.charAt( 0 ) )
				)) ? 1 : -1 } );

				selects[0].innerHTML = '<option selected disabled>pick a place:</option>' + places.map( function( place ) {
					return '<option value="' + btoa( place.coordinates ) + '">' + place.name + '</option>';
				}).join( '' );
				selects[0].onchange = function() {
					gameState.resetPlayerPos( JSON.parse( atob( selects[0].value ) ) );

					document.getElementById( 'destinations' ).style.display = 'none';
				};

				// pre-defined list of graphs to load

				const jsons = 'ABCDEF'.split( '' ).map( function( x ) { return 'cave-' + x } ); jsons.push( 'dev-home' );
				for ( let key in gameState.sceneGraphs ) if ( jsons.indexOf( key ) < 0 ) jsons.push( key );

				selects[1].innerHTML = jsons.map( function( key ) {
					return '<option value="' + key + '" ' + ((
						gameState.sceneGraphs[ key ] == sceneGraph
					) ? 'selected' : '' ) + '>' + key + '</option>';
				}).join( '' );
				selects[1].onchange = function() {
					const graphName = selects[1].value;

					if ( gameState.sceneGraphs[ graphName ] ) {
						gameState.debugLoadGraph( gameState.sceneGraphs[ graphName ], graphName );

						document.getElementById( 'destinations' ).style.display = 'none';
					} else

					fileLoader.load( 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/' + graphName + '.json', function( graphText ) {
						gameState.debugLoadGraph( graphText, graphName );

						document.getElementById( 'destinations' ).style.display = 'none';
					} );
				};

				document.getElementById( 'destinations' ).style.display = 'block';
			};
		}
	}

	//

	const helperColors = {
		'ground-basic'     : 0x00ff66, // matrix effect
		'ground-special'   : 0xffff00,
		'ground-start'     : 0x00ffff,
		'wall-limit'       : 0x0000ff,
		'wall-easy'        : 0xffffff,
		'wall-medium'      : 0x66ff00,
		'wall-hard'        : 0xff6600,
		'wall-fall'        : 0xff0000,
		'wall-slip'        : 0x00ff66, // matrix effect
		'cube-inert'       : 0x9d9d9e,
		'cube-interactive' : 0xffdebd,
		'cube-trigger'     : 0x276b00,
		'cube-trigger-invisible' : 0x276b00,
		'cube-anchor'      : 0xfc0703
	};

	const closestTiles = [], closestCubes = [], closestCompare = function( a, b ) { return b.distance - a.distance };

	//

	function debugUpdate( mustUpdate, selectedCube ) {

		if ( !mustUpdate || !helpers ) return;

		// show the closest tiles

		closestTiles.length = 0;
		closestCubes.length = 0;

		shiftedPlayerPos.copy( player.position );
		shiftedPlayerPos.y += PLAYERHEIGHT / 2 ;

		const cubeScaleFactor = 0.5 * CUBEWIDTH / Math.sqrt( 3 );

		for ( let stage = Math.floor( player.position.y ) -2; stage <= Math.floor( player.position.y ) +2; stage++ ) {
			if ( sceneGraph.tilesGraph[ stage ] ) for ( let logicTile of sceneGraph.tilesGraph[ stage ] ) {

				tileCenter.set(
					( logicTile.points[0].x + logicTile.points[1].x ) / 2,
					( logicTile.points[0].y + logicTile.points[1].y ) / 2,
					( logicTile.points[0].z + logicTile.points[1].z ) / 2
				);

				let distance = shiftedPlayerPos.distanceTo( tileCenter );
				if ( distance < 3 ) closestTiles.push ( { distance, logicTile } );

			}

			if ( sceneGraph.cubesGraph[ stage ] ) for ( let logicCube of sceneGraph.cubesGraph[ stage ] ) {

				let cubeScaleLength = tileCenter.copy( logicCube.scale ).length();

				let distance = Math.max ( 0, shiftedPlayerPos.distanceTo( logicCube.position ) - cubeScaleLength * cubeScaleFactor );
				if ( distance < 5 ) closestCubes.push ( { distance, logicCube } );

			}
		}

		closestTiles.sort ( closestCompare );
		closestCubes.sort ( closestCompare );

		let selectedTile = tileGizmo.object ? tileGizmo.object.userData.tile : undefined ;

		selectedCube = selectedCube || (
			transformControls.object ? transformControls.object.userData.cube : undefined
		);

		for ( let mesh of helpers.children ) {
			if ( mesh.name == 'tile' ) {

				if ( mesh.visible = ( closestTiles.length > 0 ) ) {

					let logicTile = closestTiles.pop ().logicTile;

					mesh.material.uniforms.color.value.setHex ( helperColors[ logicTile.type ] );

					mesh.position.set (
						( logicTile.points[0].x + logicTile.points[1].x ) / 2,
						( logicTile.points[0].y + logicTile.points[1].y ) / 2,
						( logicTile.points[0].z + logicTile.points[1].z ) / 2
					);

					mesh.rotation.set ( 0, 0, 0 );

					if ( logicTile.isWall ) {

						if ( logicTile.points[0].x == logicTile.points[1].x ) {
							mesh.rotation.y = Math.PI / 2 ;
						};

					} else {

						mesh.rotation.x = -Math.PI / 2 ;

					};

					// unlike transformControls, tileGizmo.attach() needs up-to-date position/rotation

					if ( logicTile == selectedTile ) tileGizmo.attach( mesh );

					mesh.userData.tile = logicTile;
				}
			} else

			if ( mesh.name == 'cube' ) {

				if ( mesh.visible = ( closestCubes.length > 0 ) ) {

					let logicCube = closestCubes.pop ().logicCube;

					if ( logicCube == selectedCube ) transformControls.attach( mesh );

					mesh.children[0].material.color.setHex ( helperColors[ logicCube.type ] );

					mesh.material.color.setHex ( helperColors[ logicCube.type ] );
					mesh.material.opacity = ( logicCube.type == 'cube-trigger-invisible' ) ? 0.3 : 0.6;

					mesh.position.copy ( logicCube.position );
					mesh.scale.copy ( logicCube.scale );

					mesh.userData.cube = logicCube;
				}
			}
		}

		if ( tileGizmo.object && (
			!tileGizmo.object.visible || ( tileGizmo.object.userData.tile != selectedTile )
		) ) {
			tileGizmo.detach(); closePropertiesDialog(); // detach if walked away from the tile
		}

		if ( transformControls.object && (
			!transformControls.object.visible || ( transformControls.object.userData.cube != selectedCube )
		) ) {
			transformControls.detach(); closePropertiesDialog(); // detach if walked away from the cube
		}
	}

	//

	var api = {
		debug,
		debugUpdate,
		getSceneGraph,
		collidePlayerGrounds,
		collidePlayerWalls,
		collidePlayerCubes,
		intersectRay,
		PLAYERHEIGHT,
		PLAYERWIDTH,
		player,
		startPos,
		collideCamera,
		adjTileExists,
		switchGraph,
		init
	};

	return api ;

};
