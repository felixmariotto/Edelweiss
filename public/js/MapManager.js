

function MapManager() {





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

				// console.log( atlas.player ) ;

				let x = 0 ;
				let y = 0 ;

				if ( !record[ x ] || 
					 !record[ x ][ y ] ) {

					addMapChunk( x, y );

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

		});

	};







	return {
		update
	};

};