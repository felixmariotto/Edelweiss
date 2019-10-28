

function MapManager() {





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




	function addMapChunk( x, y ) {

		// Update record

		if ( !record[ x ] ) {
			record[ x ] = [];
		};

		record[ x ][ y ] = true ;

		// Load the map chunk

		gltfLoader.load( `https://edelweiss-game.s3.eu-west-3.amazonaws.com/map/x${ x }y${ y }.glb`, (glb)=> {

			let obj = glb.scene.children[ 0 ];

			obj.material.side = THREE.FrontSide;

			obj.material = new THREE.MeshNormalMaterial();

			obj.castShadow = true ;
			obj.receiveShadow = true ;
			
			scene.add( glb.scene );

		});

	};




	return {
		update
	};

};