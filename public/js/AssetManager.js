


function AssetManager() {


	const SCALE_ALPINIST = 0.1 ;
	const SCALE_LADY = 0.1 ;
	const SCALE_EDELWEISS = 0.1 ;

	const alpinistGroup = new THREE.Group();


	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/alpinist.glb', (glb)=> {

		let model = glb.scene ;
		model.scale.set( SCALE_ALPINIST, SCALE_ALPINIST, SCALE_ALPINIST );
		scene.add( model );

		alpinistMixer = new THREE.AnimationMixer( model );

		alpinistIdle = alpinistMixer.clipAction( glb.animations[ 0 ] );
		alpinistIdle.play();

		setLambert( model );

		// temp
		model.position.x += 1 ;

	});


	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/lady.glb', (glb)=> {

		let model = glb.scene ;
		model.scale.set( SCALE_LADY, SCALE_LADY, SCALE_LADY );
		scene.add( model );

		ladyMixer = new THREE.AnimationMixer( model );

		ladyIdle = ladyMixer.clipAction( glb.animations[ 0 ] );
		ladyIdle.play();

		setLambert( model );

	});


	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/edelweiss.glb', (glb)=> {

		let model = glb.scene ;
		model.scale.set( SCALE_EDELWEISS, SCALE_EDELWEISS, SCALE_EDELWEISS );
		scene.add( model );

		setLambert( model );

	});




	//// CREATE INSTANCES

	function createNewLady( pos ) {

		console.log( 'create new lady at', pos );

		let group;

		return group;

	};





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
		alpinistGroup,
		createNewLady
	};



};