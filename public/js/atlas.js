
function Atlas( sceneGraph ) {


	const PLAYERHEIGHT = 0.65 ;
	const PLAYERWIDTH = 0.3 ;

	const CUBEWIDTH = 0.4 ;
	const INTERACTIVECUBERANGE = 0.85 ; // radius

	const NEEDHELPERS = true ;

	const NEEDPLAYERBOX = false ; // specifically allow player box helper
    const NEEDARROW = false ; // arrows showing player direction
    const NEEDTILES = false ; // add the tiles helpers

    const SCALECHARA = 0.083 ;


	var startTile ;
	var player ;

	// This is used in cube collision to know which
	// direction is the one with less collision
	var cubeColSortArr = [ 'x', 'y', 'z' ];

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



	var rayCollisionVec = new THREE.Vector3();
	var tempTriVec1 = new THREE.Vector3();
	var tempTriVec2 = new THREE.Vector3();
	var tempRayCollision ;
	var rayCollision; // This is what is returned after ray collision

	// used for wall collision
	var checkDirection ;
	var collidedWalls = [];
	var majorWall;
	var shiftedPlayerPos = new THREE.Vector3();
	var tileCenter = new THREE.Vector3();
	var wallDistance;


    /////////////////////////
    ///  HELPERS VARIABLES
	/////////////////////////
	


	// CUBES MATERIALS
	const INERTCUBEMAT = new THREE.MeshLambertMaterial({
		color: 0x9d9d9e
	});

	const INTERACTIVECUBEMAT = new THREE.MeshLambertMaterial({
		color: 0xffdebd
	});

	const TRIGGERCUBEMAT = new THREE.MeshLambertMaterial({
		color: 0x276b00
	});




    // WALLS MATERIALS
	const SLIPWALLMAT = new THREE.MeshLambertMaterial({
		color: 0xff9cc7,
		side: THREE.DoubleSide
	});

	const FALLWALLMAT = new THREE.MeshLambertMaterial({
		color: 0x9e0000,
		side: THREE.DoubleSide
	});

	const LIMITWALLMAT = new THREE.MeshLambertMaterial({
		color: 0x0f0aa6,
		side: THREE.DoubleSide
	});

	const EASYWALLMAT = new THREE.MeshLambertMaterial({
		color: 0xb0ffa8,
		side: THREE.DoubleSide
	});

	const MEDIUMWALLMAT = new THREE.MeshLambertMaterial({
		color: 0x17ad28,
		side: THREE.DoubleSide
	});

	const HARDWALLMAT = new THREE.MeshLambertMaterial({
		color: 0x057a34,
		side: THREE.DoubleSide
	});

	// GROUND MATERIALS
	const BASICGROUNDMAT = new THREE.MeshLambertMaterial({
		color: 0x777777,
		side: THREE.DoubleSide
	});

	const STARTGROUNDMAT = new THREE.MeshLambertMaterial({
		color: 0x3dffff,
		side: THREE.DoubleSide
	});




    //////////////////////
    ///     INIT
    //////////////////////


	// initialise the map
	
	for ( let i of Object.keys( sceneGraph.tilesGraph ) ) {

		sceneGraph.tilesGraph[i].forEach( (logicTile)=> {

			if ( NEEDHELPERS && NEEDTILES ) {
				Tile( logicTile );
			};

			if ( logicTile.type == 'ground-start' ) {
				startTile = logicTile ;
			};

		});

	};


	for ( let i of Object.keys( sceneGraph.cubesGraph ) ) {

		if ( sceneGraph.cubesGraph[i] ) {

			sceneGraph.cubesGraph[i].forEach( (logicCube)=> {

				if ( NEEDHELPERS ) {
					newCube( logicCube );
				};

			});

		};

	};




	// PLAYER LOGIC

	var player = Player( startTile );

	controler = Controler( player );

	charaAnim = CharaAnim( player );

	cameraControl = CameraControl( player, camera );



	function Player( startTile ) {

		// TEMP in case there is no startTile
		startTile = startTile || { points: [ {x:1, y:0, z:1}, {x:0, y:0, z:0} ] };

		let group = new THREE.Group();
		scene.add( group );

		let position = group.position ;

		group.position.set(
			(startTile.points[0].x + startTile.points[1].x) / 2,
			(startTile.points[0].y + startTile.points[1].y) / 2,
			(startTile.points[0].z + startTile.points[1].z) / 2
		);

			
		/// HELPER

		if ( NEEDHELPERS && NEEDPLAYERBOX ) {

			let mesh = new THREE.Mesh(
				new THREE.BoxBufferGeometry(
					PLAYERWIDTH,
					PLAYERHEIGHT,
					PLAYERWIDTH
					),
				new THREE.MeshLambertMaterial({
					transparent: true,
					opacity: 0.5
				})
			);
		
			group.add( mesh );
			mesh.position.y = PLAYERHEIGHT / 2 ;

		};


		/// CHARACTER

		let charaGroup = new THREE.Group();
		group.add( charaGroup );


		if ( NEEDARROW ) {

			let mesh = new THREE.Mesh(
				new THREE.ConeBufferGeometry( 0.2, 0.4, 10 ),
				new THREE.MeshNormalMaterial()
			);

			charaGroup.add( mesh );
			mesh.rotation.x = Math.PI / 2 ;
			mesh.position.y = PLAYERHEIGHT / 2 ;

		};




		gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/hero.glb', (glb)=> {


			let model = glb.scene ;
			model.scale.set( SCALECHARA, SCALECHARA, SCALECHARA );
			charaGroup.add( model );


			model.traverse( (obj)=> {

				if ( obj.type == 'Mesh' ||
					 obj.type == 'SkinnedMesh' ) {

					obj.material = new THREE.MeshLambertMaterial({
						map: obj.material.map,
						side: THREE.FrontSide,
						skinning: true
					});

					obj.castShadow = true ;
					obj.receiveShadow = true ;

				};

			});


			// get the glider object, and give it to the animation
			// module, the hide it from the scene.
			charaAnim.setGlider( model.getObjectByName('glider') );

			/// ANIMATIONS

			mixer = new THREE.AnimationMixer( glb.scene );

			glb.animations.forEach( (animClip)=> {
				actions[ animClip.name ] = mixer.clipAction( animClip );
			});

			// start all the actions but set their weight to 0
			for ( let i of Object.keys( actions ) ) {
				actions[ i ].play() ;
				actions[ i ].setEffectiveWeight( 0 );
			};

			// set start action to 1 ;
			actions.idle.setEffectiveWeight( 1 );

			// activate the glider animation, because anyway
			// the glider is not visible when not in use
			actions.gliderAction.setEffectiveWeight( 1 );

			// Set the speed of all the actions
			charaAnim.initActions();

		});



		return {
			group,
			charaGroup,
			position
		};

	};













	/////////////////////////
	///    COLLISIONS
	/////////////////////////


	function collidePlayerCubes() {

		cubeCollision.point = undefined ;
		cubeCollision.inRange = undefined ;

		checkStage( Math.floor( player.position.y ) );
		checkStage( Math.floor( player.position.y ) + 1 );
		checkStage( Math.floor( player.position.y ) - 1 );


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
					if ( !( logicCube.position.x - (CUBEWIDTH / 2) > ( player.position.x + ( PLAYERWIDTH / 2 ) ) ||
							logicCube.position.z - (CUBEWIDTH / 2) > ( player.position.z + ( PLAYERWIDTH / 2 ) ) ||
							logicCube.position.x + (CUBEWIDTH / 2) < ( player.position.x - ( PLAYERWIDTH / 2 ) ) ||
							logicCube.position.z + (CUBEWIDTH / 2) < ( player.position.z - ( PLAYERWIDTH / 2 ) ) ||
							logicCube.position.y - (CUBEWIDTH / 2) > ( player.position.y + PLAYERHEIGHT ) ||
							logicCube.position.y + (CUBEWIDTH / 2) < player.position.y ) ) {

						if ( logicCube.type != 'cube-trigger' ) {

							///////////////////////////////////////////////////////
							// Set cubeCollision.point from the cube coordinates
							///////////////////////////////////////////

							cubeCollision.point = {};

							// X DIR
							if ( logicCube.position.x > player.position.x ) {
								cubeCollision.point.x = Math.min( player.position.x, logicCube.position.x - (CUBEWIDTH / 2) - (PLAYERWIDTH / 2) );
							} else {
								cubeCollision.point.x = Math.max( player.position.x, logicCube.position.x + (CUBEWIDTH / 2) + (PLAYERWIDTH / 2) );
							};

							// Z DIR
							if ( logicCube.position.z > player.position.z ) {
								cubeCollision.point.z = Math.min( player.position.z, logicCube.position.z - (CUBEWIDTH / 2) - (PLAYERWIDTH / 2) );
							} else {
								cubeCollision.point.z = Math.max( player.position.z, logicCube.position.z + (CUBEWIDTH / 2) + (PLAYERWIDTH / 2) );
							};

							// Y DIR
							if ( logicCube.position.y > player.position.y + ( PLAYERHEIGHT / 2 ) ) {
								cubeCollision.point.y = Math.min( player.position.y, logicCube.position.y - (CUBEWIDTH / 2) - PLAYERHEIGHT );
							} else {
								cubeCollision.point.y = Math.max( player.position.y, logicCube.position.y + (CUBEWIDTH / 2) );
							};


							/// All this mess is to get cubeCollision.point value which
							// is the closest from player.position values, then clamp
							// the other two to player.position values.

							cubeColSortArr.sort( (a, b)=> {

								return Math.abs( cubeCollision.point[a] - player.position[a] ) -
									   Math.abs( cubeCollision.point[b] - player.position[b] )

							});

							cubeCollision.point[ cubeColSortArr[1] ] = player.position[ cubeColSortArr[1] ] ;
							cubeCollision.point[ cubeColSortArr[2] ] = player.position[ cubeColSortArr[2] ] ;

						} else {

							interaction.trigger( logicCube.tag );

						};

					};

				});

			};

		};

		return cubeCollision

	};












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

		// We check only the tiles at the same height as the player
		checkStage( Math.floor( player.position.y ) );
		checkStage( Math.floor( player.position.y ) + 1 );
		checkStage( Math.floor( player.position.y ) - 1 );
		


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


							////////////
							//  Y DIR
							////////////

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


							///////////
							//  X DIR
							//////////

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


							///////////
							//  Z DIR
							//////////

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


		collidedWalls = [];


		function computeDirection( logicTile ) {

			if ( logicTile.isXAligned ) {

				xCollision.direction = logicTile.points[0].z > player.position.z ? 'down' : 'up' ;

			} else {

				xCollision.direction = logicTile.points[0].x > player.position.x ? 'right' : 'left' ;

			};

		};


		/*
		// temp
		if ( xCollision.majorWallType ) {
			console.log( xCollision );
		};
		*/


		return xCollision ;

	};



	

    






	function intersectRay( ray, mustTestGrounds ) {

		rayCollision = undefined ;

		checkStage( Math.floor( player.position.y ) );
		checkStage( Math.floor( player.position.y ) + 1 );
		checkStage( Math.floor( player.position.y ) + 2 );
		checkStage( Math.floor( player.position.y ) + 3 );

		return rayCollision ;


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

							tempRayCollision = ray.intersectTriangle(
								tempTriVec1,
								tempTriVec2,
								logicTile.points[0],
								false, // must try backface culling later
								rayCollisionVec
							);

							if ( tempRayCollision ) {
								// Here it may be useful to make a length check
								rayCollision = tempRayCollision ;
							};

						});


					};

				});

			};

		};

	};


















    /////////////////////////////
    ///     HELPERS PART
    ////////////////////////////



    function Tile( logicTile ) {

		let meshTile = MeshTile( logicTile ) ;
		meshTile.logicTile = logicTile ;
		scene.add( meshTile );

		return meshTile ;

    };
    



    function MeshTile( logicTile ) {

		// get material according to logicType's type
		let material = getMaterial( logicTile.type );

		let geometry = new THREE.PlaneBufferGeometry( 1, 1, 1 );

		let mesh = new THREE.Mesh( geometry, material );

		mesh.position.set(
			( logicTile.points[0].x + logicTile.points[1].x ) / 2,
			( logicTile.points[0].y + logicTile.points[1].y ) / 2,
			( logicTile.points[0].z + logicTile.points[1].z ) / 2
		);


		if ( logicTile.isWall ) {

			if ( logicTile.points[0].x == logicTile.points[1].x ) {
				mesh.rotation.y = Math.PI / 2 ;
			};

		} else {

			mesh.rotation.x = Math.PI / 2 ;

		};

		return mesh ;

    };
	
	



    function newCube( logicCube ) {

		let meshCube = MeshCube( logicCube );
		meshCube.logicCube = logicCube ;
		scene.add( meshCube );
		dynamicItems.addCube( meshCube );

		return meshCube ;

	};




	function MeshCube( logicCube ) {

		let material = getMaterial( logicCube.type );
		let geometry = new THREE.BoxBufferGeometry(
			CUBEWIDTH,
			CUBEWIDTH,
			CUBEWIDTH
		);
		let mesh = new THREE.Mesh( geometry, material );

		mesh.position.copy( logicCube.position );

		return mesh ;

	};







	function getMaterial( type ) {

		switch ( type ) {

			case 'ground-basic' :
				return BASICGROUNDMAT ;

			case 'ground-start' :
				return STARTGROUNDMAT ;
			
			case 'wall-limit' :
				return LIMITWALLMAT ;

			case 'wall-easy' :
				return EASYWALLMAT ;

			case 'wall-medium' :
				return MEDIUMWALLMAT ;

			case 'wall-hard' :
				return HARDWALLMAT ;

			case 'wall-fall' :
				return FALLWALLMAT ;

			case 'wall-slip' :
				return SLIPWALLMAT ;

			case 'cube-inert' :
				return INERTCUBEMAT ;

			case 'cube-interactive' :
				return INTERACTIVECUBEMAT ;

			case 'cube-trigger' :
				return TRIGGERCUBEMAT ;

			default :
				console.error('cannot get material');
				break;

		};

	};



	return {
		collidePlayerGrounds,
		collidePlayerWalls,
		collidePlayerCubes,
		intersectRay,
		PLAYERHEIGHT,
		PLAYERWIDTH,
		sceneGraph,
		player
	};


};