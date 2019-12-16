


function AssetManager() {


	const SCALE_ALPINIST = 0.1 ;
	const SCALE_LADY = 0.1 ;
	const SCALE_EDELWEISS = 0.1 ;

	const alpinistGroup = new THREE.Group();


	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/alpinist.glb', (glb)=> {

		let model = glb.scene ;
		model.scale.set( SCALE_ALPINIST, SCALE_ALPINIST, SCALE_ALPINIST );
		alpinistGroup.add( model );

		setLambert( model );

	});


	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/lady.glb', (glb)=> {

		let model = glb.scene ;
		model.scale.set( SCALE_LADY, SCALE_LADY, SCALE_LADY );
		scene.add( model );

		setLambert( model );

	});


	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/edelweiss.glb', (glb)=> {

		let model = glb.scene ;
		model.scale.set( SCALE_EDELWEISS, SCALE_EDELWEISS, SCALE_EDELWEISS );
		scene.add( model );

		setLambert( model );

	});





	//// GENERAL

	function setLambert( model ) {

		// temp
		model.position.set( 0, 2, 0 );

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

	};



	return {
		alpinistGroup
	};



};