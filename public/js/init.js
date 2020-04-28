
function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.01, 23.5 );

    // a directional light is later added on the CameraControl module,
    // since this latter will follow the camera movements
    ambientLight = new THREE.AmbientLight( 0xffffff, 0.48 );
	scene.add( ambientLight );

    //////////////
    /// RENDERER
    //////////////

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('world') });

    renderer.autoClear = false;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true ;

    // anti-aliasing setup

    var renderPass = new THREE.RenderPass( scene, camera );

    fxaaPass = new THREE.ShaderPass( THREE.FXAAShader );

    var pixelRatio = renderer.getPixelRatio();

    fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
    fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );

    composer = new THREE.EffectComposer( renderer );
    composer.addPass( renderPass );
    composer.addPass( fxaaPass );

    /////////////////////
    ///   MISC
    /////////////////////

    clock = new THREE.Clock();

    var manager = new THREE.LoadingManager();

    gltfLoader = new THREE.GLTFLoader(manager);
    var dracoLoader = new THREE.DRACOLoader();

    dracoLoader.setDecoderPath( 'libs/draco/' )
    gltfLoader.setDRACOLoader( dracoLoader );

    textureLoader = new THREE.TextureLoader();
    fileLoader = new THREE.FileLoader()

    //

    assetManager = AssetManager();

    // event handlers for multiplayer

    var updateCharacters = function( data ) {

        var animation = characterAnimations[ data.id ];

        // Handle the case when a new player is sending their data.
        // A new character will be added to the scene.
        if ( !animation ) {

            var character = assetManager.createCharacter( utils.stringHash( data.id ), data.name );
            character.model.name = data.id; // for removal
            scene.add( character.model );

            animation = CharaAnim({
                actions: character.actions,
                charaGroup: character.model,
                target: new THREE.Vector3(),
                position: character.model.position
            });

            characterAnimations[ data.id ] = animation;
        };

        animation.setPlayerState( data );
    };

    //

    var removeCharacters = function( id ) {

        var group = scene.getObjectByName( id );

        if( group ) scene.remove( group ) && assetManager.releaseCharacter( group );

        delete characterAnimations[ id ];

    };

    //

    manager.onLoad = function() {

        manager.onLoad = function() {};

        uaParser = new UAParser();
        socketIO = SocketIO();
        atlas = Atlas();
        input = Input();
        stamina = Stamina();
        interaction = Interaction();
        dynamicItems = DynamicItems();
        mapManager = MapManager();
        optimizer = Optimizer();
        gameState = GameState();
        soundMixer = SoundMixer();

        socketIO.onPlayerUpdates( updateCharacters );
        socketIO.onPlayerDisconnects( removeCharacters );

        loop();

    };

};
