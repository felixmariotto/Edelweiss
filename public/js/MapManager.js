

function MapManager() {



	const CHUNK_SIZE = 12 ;
	const LAST_CHUNK_ID = 14 ;

	// Array that will contain a positive boolean on the ID
	// corresponding to the loaded map chunks
	var record = [];

	// Can be "mountain", or "cave-A" (B,C,D,E,F,G)
	var currentMap = 'mountain';



	/*
	Creation of groups that will contain the different maps.
	All these groups will be added to the scene, and
	hided/showed later on.
	*/


	var maps = {};
	addMapGroup( 'cave-A' );
	addMapGroup( 'cave-B' );
	addMapGroup( 'cave-C' );
	addMapGroup( 'cave-D' );
	addMapGroup( 'cave-E' );
	addMapGroup( 'cave-F' );
	addMapGroup( 'cave-G' );
	addMapGroup( 'mountain' );
	maps.mountain.visible = true ;

	function addMapGroup( groupName ) {

		maps[ groupName ] = new THREE.Group();
		maps[ groupName ].visible = false;
		scene.add( maps[ groupName ] );

	};





	function update( mustFindMap ) {

		if ( mustFindMap &&
			 currentMap == 'mountain' &&
			 atlas &&
			 atlas.player ) {

			// Get current map chunk ID from player's z pos
			let z = Math.floor( -atlas.player.position.z / CHUNK_SIZE ) ;
			if ( z < 0 ) z = 0 ;

			// request chunks of map near player's position

			requestChunk( z );
			requestChunk( z + 1 );
			requestChunk( z + 2 );
			requestChunk( z + 3 );

			function requestChunk( z ) {

				if ( z <= LAST_CHUNK_ID ) {

					addMapChunk( z );

				};

			};

		};

	};




	// This is called in update function of this module.
	// Every time the player enter a new area, it download
	// the new chunks of map and adds it to the sccene
	function addMapChunk( z ) {

		// Update record so we know that this chunks is loaded
		if ( !record[ z ] ) {

			record[ z ] = true;

			console.log('load slice number ' + z );

			// Load the map chunk
			gltfLoader.load( `https://edelweiss-game.s3.eu-west-3.amazonaws.com/map/${ z }.glb`, (glb)=> {

				let obj = glb.scene.children[ 0 ];

				obj.material = new THREE.MeshLambertMaterial({
					map: obj.material.map,
					side: THREE.FrontSide
				});

				obj.castShadow = true ;
				obj.receiveShadow = true ;
				
				maps.mountain.add( glb.scene );

				record[ z ] = glb.scene ;

			}, null, (err)=> {

				console.log( `Impossible to load file ${ z }.glb` );

			});

		};

	};





	// Make current map disappear, and show a new map
	function switchMap( newMapName ) {

		return new Promise( (resolve, reject)=> {

			maps[ currentMap ].visible = false ;
			maps[ newMapName ].visible = true ;
			currentMap = newMapName ;

			resolve();

		});

	};







	return {
		update,
		switchMap
	};

};