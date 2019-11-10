

function MapManager() {



	const CHUNK_SIZE = 3 ;

	const CHUNK_LIST = [
		// Y == 0
		'x1y0', 'x0y0', 'x-0y0', 'x-1y0', 'x-2y0',
		// Y == 1
		'x1y1', 'x0y1', 'x-0y1', 'x-1y1',
		// Y == 2
		'x1y2', 'x0y2', 'x-0y2', 'x-1y2'
	];



	//// TEMP

	/*

	gltfLoader.load( `https://edelweiss-game.s3.eu-west-3.amazonaws.com/map/chunks.glb`, (glb)=> {

		console.log( glb );

		glb.scene.traverse( (obj)=> {

			if ( obj.type == "Mesh" ) {

				obj.material = new THREE.MeshLambertMaterial({
					map: obj.material.map,
					side: THREE.FrontSide
				});

				obj.castShadow = true ;
				obj.receiveShadow = true ;
				
				scene.add( glb.scene );

			};

		});

	});

	*/





	var record = {
		/* 

		elements are like this :

		-1 : [
			true,
			null,
			true
		]

		the property name is the reference in x direction,
		it can be positive or negative.

		the array contain the reference in y direction.
		So in this example, x-1y0 and x-1y2 were visited,
		but not x-1y1.

		*/
	};




	function update( mustFindMap ) {

		if ( mustFindMap ) {

			if ( atlas &&
				 atlas.player ) {

				// Get player's x and y pos
				let x = atlas.player.position.x / CHUNK_SIZE ;
				let y = atlas.player.position.y / CHUNK_SIZE ;

				// request chunks around player's position

				requestChunk( x, y );
				requestChunk( x + 1, y );
				requestChunk( x - 1, y );

				requestChunk( x, y + 1 );
				requestChunk( x + 1, y + 1 );
				requestChunk( x - 1, y + 1 );

				requestChunk( x, y - 1 );
				requestChunk( x + 1, y - 1 );
				requestChunk( x - 1, y - 1 );

				function requestChunk( x, y ) {

					// Round coords toward zero
					x = x > 0 ? Math.floor( x ) : Math.ceil( x ) ;
					y = y > 0 ? Math.floor( y ) : Math.ceil( y ) ;

					// Handle the case of negative zero
					if ( x === 0 && ( 1 / x ) === -Infinity ) x = '-0' ;
					if ( y === 0 && ( 1 / y ) === -Infinity ) y = '-0' ;

					// console.log( `x${ x }y${ y }` );

					if ( !record[ x ] || 
						 !record[ x ][ y ] ) {

						if ( CHUNK_LIST.indexOf( `x${ x }y${ y }` ) > -1 ) {

							addMapChunk( x, y );

						};

					};

				};

			};

		};

	};




	// This is called in update function of this module.
	// Every time the player enter a new area, it download
	// the new chunks of map and adds it to the sccene
	function addMapChunk( x, y ) {

		// Update record

		if ( !record[ x ] ) {
			record[ x ] = [];
		};

		record[ x ][ y ] = true ;

		// Load the map chunk

		gltfLoader.load( `https://edelweiss-game.s3.eu-west-3.amazonaws.com/map/x${ x }y${ y }.glb`, (glb)=> {

			let obj = glb.scene.children[ 0 ];

			obj.material = new THREE.MeshLambertMaterial({
				map: obj.material.map,
				side: THREE.FrontSide
			});

			obj.castShadow = true ;
			obj.receiveShadow = true ;
			
			scene.add( glb.scene );

		}, null, (err)=> {

			console.log( `Impossible to load file x${ x }y${ y }` );

		});

	};







	return {
		update
	};

};