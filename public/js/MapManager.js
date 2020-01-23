

function MapManager() {



	const CHUNK_SIZE = 12 ;
	const LAST_CHUNK_ID = 14 ;

	// Object that will contain a positive boolean on the index
	// corresponding to the ID of the loaded mountain map chunks,
	// and the name of the loaded caves (cave-A...)
	var record = {};

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





	/*
	Only run if the player is in the main map (mountain).
	It loads new chunks of map to the scene along the path
	of the player, to save loading time at startup.
	*/
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

				if ( z <= LAST_CHUNK_ID && !record[ z ] ) {

					record[ z ] = true;

					console.log('load slice number ' + z );

					// Load the map chunk
					loadMap( z );

				};

			};

		};

	};









	function loadMap( mapName ) {

		gltfLoader.load( `https://edelweiss-game.s3.eu-west-3.amazonaws.com/map/${ mapName }.glb`, (glb)=> {

			let obj = glb.scene.children[ 0 ];

			obj.material = new THREE.MeshLambertMaterial({
				map: obj.material.map,
				side: THREE.FrontSide
			});

			obj.castShadow = true ;
			obj.receiveShadow = true ;
			
			maps[ currentMap ].add( glb.scene );

		}, null, (err)=> {

			console.error( `Impossible to load file ${ mapName }.glb` );

		});

	};





	// Make current map disappear, and show a new map
	function switchMap( newMapName ) {

		return new Promise( (resolve, reject)=> {

			maps[ currentMap ].visible = false ;
			maps[ newMapName ].visible = true ;
			currentMap = newMapName ;

			/*
			if the new map is the mountain, then the map will be udpated
			on the fly. If not, then the cave map is loaded here.
			*/
			if ( newMapName == 'mountain' ) {

				resolve();

			} else {

				loadMap( newMapName );
				resolve();

			};

		});

	};







	return {
		update,
		switchMap
	};

};