
function Atlas( sceneGraph ) {



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




    //////////////////////
    ///     INIT
    //////////////////////


    if ( NEEDHELPERS ) {

        for ( let i of Object.keys( sceneGraph ) ) {

            sceneGraph[i].forEach( (logicTile)=> {

                Tile( logicTile )

            });

        };

    };


    /////////////////////////////
    ///     HELPERS PART
    ////////////////////////////



    function Tile( logicTile ) {

		// GROUND
		if ( logicTile.points[0].y == logicTile.points[1].y ) {

			logicTile.type = 'ground-basic' ;

		// WALL
		} else {

			logicTile.type = 'wall-slip' ;
			logicTile.isWall = true ;

			if ( logicTile.points[0].z == logicTile.points[1].z ) {
			
				logicTile.isXAligned = true ;

			} else {

				logicTile.isXAligned = false ;
			};

		};

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



};