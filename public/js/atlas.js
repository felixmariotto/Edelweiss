
function Atlas( sceneGraph ) {


	var startTile ;
	var player ;

	const PLAYERHEIGHT = 0.6 ;
	const PLAYERWIDTH = 0.4 ;


    /////////////////////////
    ///  HELPERS VARIABLES
    /////////////////////////

    const NEEDHELPERS = true ;

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
	
	for ( let i of Object.keys( sceneGraph ) ) {

		sceneGraph[i].forEach( (logicTile)=> {

			if ( NEEDHELPERS ) {
				Tile( logicTile );
			};

			if ( logicTile.type == 'ground-start' ) {
				startTile = logicTile ;
			};

		});

	};

	// initialise the player logic


	var player = Player( startTile );

	controler = Controler( player );

	function Player( startTile ) {

		let group = new THREE.Group();
		scene.add( group );

		let position = group.position ;

		group.position.set(
			(startTile.points[0].x + startTile.points[1].x) / 2,
			(startTile.points[0].y + startTile.points[1].y) / 2,
			(startTile.points[0].z + startTile.points[1].z) / 2
		);

		if ( NEEDHELPERS ) {

			let mesh = new THREE.Mesh(
				new THREE.BoxBufferGeometry(
					PLAYERWIDTH,
					PLAYERHEIGHT,
					PLAYERWIDTH
					),
				new THREE.MeshNormalMaterial()
			);
		
			group.add( mesh );
			mesh.position.y = PLAYERHEIGHT / 2 ;

		};

		return {
			group,
			position
		};

	};





	function collidePlayerGround() {

		let isColliding ;

		checkStage( Math.floor( player.position.y ) );
		checkStage( Math.floor( player.position.y ) + 1 );

		function checkStage( stage ) {

			if ( sceneGraph[ stage ] ) {

				// loop through the group of tiles at the same height as the player
				sceneGraph[ stage ].forEach( (logicTile)=> {

					if ( !logicTile.isWall ) {

						// check for X Z collision
						if ( !( Math.min( logicTile.points[0].x, logicTile.points[1].x ) > ( player.position.x + ( PLAYERWIDTH / 2 ) ) ||
								Math.min( logicTile.points[0].z, logicTile.points[1].z ) > ( player.position.z + ( PLAYERWIDTH / 2 ) ) ||
								Math.max( logicTile.points[0].x, logicTile.points[1].x ) < ( player.position.x - ( PLAYERWIDTH / 2 ) ) ||
								Math.max( logicTile.points[0].z, logicTile.points[1].z ) < ( player.position.z - ( PLAYERWIDTH / 2 ) )  ) ) {

							// check for down collision
							if ( player.position.y < logicTile.points[0].y &&
								 logicTile.points[0].y < player.position.y + (PLAYERHEIGHT / 2) ) {

								// return the position of the player on the ground
								isColliding = logicTile.points[0].y ;

							};

							// check for up collision
							if ( player.position.y + PLAYERHEIGHT > logicTile.points[0].y &&
								 player.position.y + (PLAYERHEIGHT / 2) < logicTile.points[0].y ) {

								// return the position of the player after hitting the roof
								isColliding = logicTile.points[0].y - PLAYERHEIGHT ;

							};

						};

					};

				});
	
			};
			
		};

		return isColliding
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

		};

	};



	return {
		collidePlayerGround
	};


};