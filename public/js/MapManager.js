
function MapManager() {

	const CHUNK_SIZE = 12 ;
	const LAST_CHUNK_ID = 13 ;

	// LIGHTS

	const LIGHT_BASE_INTENS = 0.48;
	const LIGHT_CAVE_INTENS = 0.30;

	const POINT_LIGHT_INTENS = 0.5;
	const POINT_LIGHT_LENGTH = 9;

	// FOG

	const FOG = new THREE.FogExp2( 0xd7cbb1, 0.06 );

	scene.fog = FOG;

	// CUBEMAP

    var path = 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/skybox/';
    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    var reflectionCube = new THREE.CubeTextureLoader().load( urls );
    reflectionCube.format = THREE.RGBFormat;

    var caveBackground = new THREE.Color( 0x251e16 );
    var caveBackgroundGrey = new THREE.Color( 0x171614 );

    scene.background = reflectionCube;

    //

	// Object that will contain a positive boolean on the index
	// corresponding to the ID of the loaded mountain map chunks,
	// and the name of the loaded caves (cave-A...)
	var record = {};

	// Can be "mountain", or "cave-A" (B,C,D,E,F,G)
	var params = {
		currentMap: "mountain"
	};

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
	addMapGroup( 'dev-home' );
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
			 params.currentMap == 'mountain' &&
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

					record[ z ] = true ;

					// Load the map chunk
					loadMap( z );

				};

			};

		};

	};

	//

	function loadMap( mapName, resolve ) {

		gltfLoader.load( `https://edelweiss-game.s3.eu-west-3.amazonaws.com/map/${ mapName }.glb`, (glb)=> {

			// console.log( '///// MAP LOADED : ' + mapName );

			glb.scene.traverse( (child)=> {

				if ( child.material ) {

					child.material = new THREE.MeshLambertMaterial({
						map: child.material.map,
						side: THREE.FrontSide
					});

					child.castShadow = true ;
					child.receiveShadow = true ;

				};

			});
			
			maps[ params.currentMap ].add( glb.scene );
			record[ mapName ] = true;

			if ( resolve ) resolve();

		}, null, (err)=> {

			console.error( `Impossible to load file ${ mapName }.glb` );

			if ( resolve ) resolve();

		});

	};

	// Make current map disappear, and show a new map
	function switchMap( newMapName ) {

		if ( newMapName === "mountain" ) {

			scene.fog = FOG;
			scene.background = reflectionCube;
			ambientLight.intensity = LIGHT_BASE_INTENS;

		} else {

			scene.fog = undefined;
			scene.background = caveBackground;
			ambientLight.intensity = LIGHT_CAVE_INTENS;

		};

		if ( newMapName === "cave-F" ) scene.background = caveBackgroundGrey;
		if ( newMapName === "dev-home" ) ambientLight.intensity = LIGHT_BASE_INTENS;

		return new Promise( (resolve, reject)=> {

			if ( !maps[ newMapName ] ) addMapGroup( newMapName );

			maps[ params.currentMap ].visible = false ;
			maps[ newMapName ].visible = true ;
			params.currentMap = newMapName ;

			// change lighting according to future map
			if ( newMapName == 'mountain' ) {

				cameraControl.showLight();
				removeCaveLights();

			} else {

				cameraControl.hideLight();
				createCaveLights( newMapName );

			};

			/*
			if the new map is the mountain, then the map will be udpated
			on the fly. If not, then the cave map is loaded here.
			*/
			if ( newMapName == 'mountain' ||
				 record[ newMapName ] ) {

				resolve();

			} else {

				loadMap( newMapName, resolve );

			};

		});

	};

	//

	var caveLights = [];

	function createCaveLights( graphName ) {

		var graph = gameState.sceneGraphs[ graphName ].cubesGraph;

		for (let i = 0 ; i < graph.length ; i++ ) {

			if ( !graph[ i ] ) continue ;

			graph[ i ].forEach( ( cube )=> {

				if ( cube.tag && cube.tag.match( /cave-/ ) ) {

					var pos = cube.position ;

					var light = new THREE.PointLight(
						0xffffff,
						POINT_LIGHT_INTENS,
						POINT_LIGHT_LENGTH
					);

					light.position.set( pos.x, pos.y, pos.z );
					scene.add( light );
					caveLights.push( light );

				};

			});

		};

	};

	//

	function removeCaveLights() {

		caveLights.forEach( ( light )=> {

			scene.remove( light );

		});

		caveLights = [];

	};

	//

	return {
		update,
		switchMap,
		params
	};

};
