

 

function Atlas() {


	var sceneGraph ;

	const PLAYERHEIGHT = 0.62 ;
	const PLAYERWIDTH = 0.3 ;

	const CUBEWIDTH = 0.4 ;
	const INTERACTIVECUBERANGE = 0.82 ; // radius

	const WATER_LEVEL = 0.5 ;

	const NEEDHELPERS = true ;

	const NEEDPLAYERBOX = false ; // specifically allow player box helper
    const NEEDARROW = false ; // arrows showing player direction
    const NEEDTILES = false ; // add the tiles helpers
    const NEEDCUBES = false ;
    const NEEDPLANES = false ; // show helpers for limit planes
    const NEED_WATER_HELPER = false ;

    const SCALECHARA = 0.075 ;

    const CUBE_INTERSECTION_OFFSET = 0.001 ;


	var startPos = new THREE.Vector3();

	var planes = [];


	var cameraCollision = false ;

	// This is used in cube collision to know which
	// direction is the one with less collision
	var collisionSortArr = [ 'x', 'y', 'z' ];

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

	const INVTRIGGERCUBEMAT = new THREE.MeshLambertMaterial({
		color: 0x276b00,
		transparent: true,
		opacity: 0.5
	});

	const ANCHORCUBEMAT = new THREE.MeshLambertMaterial({
		color: 0xfc0703
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

	const SPECIALGROUNDMAT = new THREE.MeshLambertMaterial({
		color: 0xff9b05,
		side: THREE.DoubleSide
	});

	const STARTGROUNDMAT = new THREE.MeshLambertMaterial({
		color: 0x3dffff,
		side: THREE.DoubleSide
	});














    //////////////////////
    ///     INIT
    //////////////////////

    function init( obj ) {

    	sceneGraph = obj ;

    	// initialise the map
		initHelpers( 'init' );

    };


	

	
	function initHelpers( gateName ) {

		for ( let i of Object.keys( sceneGraph.tilesGraph ) ) {

			if ( !sceneGraph.tilesGraph[i] ) continue

			sceneGraph.tilesGraph[i].forEach( (logicTile)=> {

				if ( NEEDHELPERS && NEEDTILES ) {
					Tile( logicTile );
				};

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

			});

		};


		for ( let i of Object.keys( sceneGraph.cubesGraph ) ) {

			if ( sceneGraph.cubesGraph[i] ) {

				sceneGraph.cubesGraph[i].forEach( (logicCube)=> {

					if ( NEEDHELPERS && NEEDCUBES ) {
						newCube( logicCube );
					};

					dynamicItems.addCube( logicCube );

				});

			};

		};


		// Can remove conditional later
		if ( sceneGraph.planes ) {

			sceneGraph.planes.forEach( (importedPlane)=> {

				var plane = new THREE.Plane(
					new THREE.Vector3(
						importedPlane.norm.x,
						0,
						importedPlane.norm.z
					),
					importedPlane.const
				);

				planes.push( plane );

				if ( NEEDPLANES ) {
					var helper = new THREE.PlaneHelper( plane, 1, 0xffff00 );
					helper.isHelper = true ;
					scene.add( helper );
				};

			});

		};

		if ( gateName == 'init' ) gameState.die();

	};






	/*
	clearHelpers clear the Map of all the helpers (if any)
	*/
	function clearHelpers() {

		return new Promise( ( resolve, reject )=> {

			planes = [];

			for ( let i = scene.children.length -1 ; i > -1 ; i-- ) {

				if ( scene.children[ i ].isHelper ) {

					scene.children[ i ].geometry.dispose();
					scene.remove( scene.children[ i ] );

				};

				if ( i == 0 ) resolve();

			};

		});

	};








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


	if ( NEEDHELPERS && NEED_WATER_HELPER ) {


		var geometry = new THREE.PlaneBufferGeometry( 50, 50 );
		var material = new THREE.MeshBasicMaterial({ color: 0x2d4f5, side: THREE.DoubleSide });
		var plane = new THREE.Mesh( geometry, material );

		plane.rotation.x = Math.PI / 2 ;
		plane.position.y = WATER_LEVEL ;

		scene.add( plane );

	};










	// PLAYER LOGIC

	var player = Player();

	controler = Controler( player );

	charaAnim = CharaAnim( player );

	cameraControl = CameraControl( player, camera );



	function Player() {

		let group = new THREE.Group();
		scene.add( group );

		let position = group.position ;

		group.position.copy( startPos );

			
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




	function cubeCollides( logicCube ) {

		return !( logicCube.position.x - ( (CUBEWIDTH * logicCube.scale.x ) / 2) > ( player.position.x + ( PLAYERWIDTH / 2 ) ) ||
				  logicCube.position.z - ( (CUBEWIDTH * logicCube.scale.z ) / 2) > ( player.position.z + ( PLAYERWIDTH / 2 ) ) ||
				  logicCube.position.x + ( (CUBEWIDTH * logicCube.scale.x ) / 2) < ( player.position.x - ( PLAYERWIDTH / 2 ) ) ||
				  logicCube.position.z + ( (CUBEWIDTH * logicCube.scale.z ) / 2) < ( player.position.z - ( PLAYERWIDTH / 2 ) ) ||
				  logicCube.position.y - ( (CUBEWIDTH * logicCube.scale.y ) / 2) > ( player.position.y + PLAYERHEIGHT ) ||
				  logicCube.position.y + ( (CUBEWIDTH * logicCube.scale.y ) / 2) < player.position.y )

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




		function computeDirection( logicTile ) {

			if ( logicTile.isXAligned ) {

				xCollision.direction = logicTile.points[0].z > player.position.z ? 'down' : 'up' ;

			} else {

				xCollision.direction = logicTile.points[0].x > player.position.x ? 'right' : 'left' ;

			};

		};



	};



	

    






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

		mesh.isHelper = true ;

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
		logicCube.helper = meshCube ;
		scene.add( meshCube );

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
		mesh.scale.copy( logicCube.scale );

		mesh.isHelper = true ;

		return mesh ;

	};







	function getMaterial( type ) {

		switch ( type ) {

			case 'ground-basic' :
				return BASICGROUNDMAT ;

			case 'ground-special' :
				return SPECIALGROUNDMAT ;

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

			case 'cube-trigger-invisible' :
				return INVTRIGGERCUBEMAT ;

			case 'cube-anchor' :
				return ANCHORCUBEMAT ;

			default :
				console.error('cannot get material for ' + type );
				break;

		};

	};





























	/////////////////////////
	///    FUNCTIONS
	/////////////////////////








	// adjTileExists is used by cameraControl to know if the tile
	// obstructing the camera path has an adjacent tile in the
	// specified direction.

	var testTileVecs = [
		new THREE.Vector3(),
		new THREE.Vector3()
	];

	function adjTileExists( testTile, dir, sign ) {

		let exists = false ;

		// create the vector if the hypotetic tile

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

			[ testTileVecs[0].x, testTileVecs[1].x ] = [ testTileVecs[1].x, testTileVecs[0].x ];
			[ testTileVecs[0].y, testTileVecs[1].y ] = [ testTileVecs[1].y, testTileVecs[0].y ];

			sceneGraph.tilesGraph[ Math.min( testTileVecs[0].y, testTileVecs[1].y ) ].forEach( (logicTile)=> {

				if ( (utils.vecEquals( testTileVecs[0], logicTile.points[0] ) && utils.vecEquals( testTileVecs[1], logicTile.points[1] ) ) ||
					 (utils.vecEquals( testTileVecs[1], logicTile.points[0] ) && utils.vecEquals( testTileVecs[0], logicTile.points[1] ) ) ) {

					exists = true ;

				};

			});

		};

		return exists ;

	};












	function switchGraph( graphName, gateName, respawn ) {

		sceneGraph = gameState.sceneGraphs[ graphName ];

		// hide/show the relevant assets according to the next map
		assetManager.updateGraph( graphName );

		soundMixer.switchGraph( graphName );

		mapManager.switchMap( graphName ).then( ()=> {

			clearHelpers().then( ()=> {

				initHelpers( gateName );

				if ( respawn ) {

					player.position.copy( gameState.respawnPos );

				} else {

					gameState.endPassGateAnim();

				};

			});

		});

	};








	function getSceneGraph() {
		return sceneGraph ;
	};









	var api = {
		getSceneGraph,
		collidePlayerGrounds,
		collidePlayerWalls,
		collidePlayerCubes,
		intersectRay,
		PLAYERHEIGHT,
		PLAYERWIDTH,
		WATER_LEVEL,
		player,
		deleteCubeFromGraph,
		startPos,
		collideCamera,
		adjTileExists,
		switchGraph,
		init
	};



	return api ;


};