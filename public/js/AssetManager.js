


function AssetManager() {

	const SCALE_ALPINIST = 0.1 ;
	const SCALE_LADY = 0.1 ;
	const SCALE_EDELWEISS = 0.1 ;

	var alpinistMixers = [], alpinistIdles = [];
	var ladyMixers = [], ladyIdles = [];

	var alpinists = [];
	var edelweisses = [];
	var ladies = [];

	addGroups( alpinists, 7 ); // unsure
	addGroups( edelweisses, 7 ); // unsure
	addGroups( ladies, 12 );

	function addGroups( arr, groupsNumber ) {

		for ( let i = 0 ; i < groupsNumber ; i++ ) {

			arr.push( new THREE.Group() );

		};

	};


	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/alpinist.glb', (glb)=> {

		let model = glb.scene ;
		model.scale.set( SCALE_ALPINIST, SCALE_ALPINIST, SCALE_ALPINIST );
		scene.add( model );

		alpinistMixers[ 0 ] = new THREE.AnimationMixer( model );

		alpinistIdles[ 0 ] = alpinistMixers[ 0 ].clipAction( glb.animations[ 0 ] );
		alpinistIdles[ 0 ].play();

		setLambert( model );

		// temp
		model.position.x += 1 ;

	});


	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/lady.glb', (glb)=> {

		let model = glb.scene ;
		model.scale.set( SCALE_ALPINIST, SCALE_ALPINIST, SCALE_ALPINIST );

		for ( let i = 0 ; i < ladies.length ; i++ ) {

			let newModel = THREE.SkeletonUtils.clone( model );

			ladies[ i ].add( newModel );

			ladyMixers[ i ] = new THREE.AnimationMixer( newModel );

			ladyIdles[ i ] = ladyMixers[ i ].clipAction( glb.animations[ 0 ] );
			ladyIdles[ i ].play();

			setLambert( newModel );

		};
		

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

		for ( ladyGroup of ladies ) {

			if ( !ladyGroup.userData.isSet ) {

				ladyGroup.userData.isSet = true ;

				console.log( ladyGroup );

				ladyGroup.position.copy( pos );

				scene.add( ladyGroup );

				break ;

			};

		};

	};





	//// GENERAL

	function setLambert( model ) {

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



	function update( delta ) {

		alpinistMixers.forEach( (mixer)=> {

			mixer.update( delta );

		});

		ladyMixers.forEach( (mixer)=> {

			mixer.update( delta );

		});

	};



	return {
		createNewLady,
		update
	};



};