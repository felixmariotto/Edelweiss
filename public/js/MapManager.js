

function MapManager() {



	const CHUNK_SIZE = 12 ;
	const LAST_CHUNK_ID = 15 ;

	// Array that will contain a positive boolean on the ID
	// corresponding to the loaded map chunks
	var record = [];




	function update( mustFindMap ) {

		if ( mustFindMap ) {

			if ( atlas && atlas.player ) {

				// Get current map chunk ID from player's z pos
				let z = Math.floor( -atlas.player.position.z / CHUNK_SIZE ) ;
				if ( z < 0 ) z = 0 ;

				// request chunks near player's position

				requestChunk( z );
				requestChunk( z + 1 );
				requestChunk( z + 2 );

				function requestChunk( z ) {

					if ( z <= LAST_CHUNK_ID ) {

						addMapChunk( z );

					};

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
				
				scene.add( glb.scene );

				record[ z ] = glb.scene ;

			}, null, (err)=> {

				console.log( `Impossible to load file ${ z }.glb` );

			});

		};

	};







	return {
		update
	};

};