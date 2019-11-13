
function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x222222 );

    // temp
    // scene.overrideMaterial = new THREE.MeshNormalMaterial();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.2, 50 );

    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.48 );
	scene.add( ambientLight );

    stats = new Stats();
    document.body.appendChild( stats.dom );
    stats.dom.style.right = '0px' ;
    stats.dom.style.left = 'auto' ;



    /////////////////////
    //   RENDERERS
    /////////////////////

    /*
    There is two renderers, one quite demending for the
    GPU, and one cheaper. highRenderer is the default,
    but if low FPS is detected in the render loop, we
    switch to cheapRenderer.
    */


    cheapRenderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('worldCheap'),
        antialias: false
    });
    
    cheapRenderer.setPixelRatio( window.devicePixelRatio );
    cheapRenderer.setSize( window.innerWidth, window.innerHeight );
    cheapRenderer.shadowMap.enabled = true ;
    

    ////////////////

    highRenderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('worldHigh'),
        antialias: true
    });
    highRenderer.setPixelRatio( window.devicePixelRatio );
    highRenderer.setSize( window.innerWidth, window.innerHeight );
    highRenderer.shadowMap.enabled = true ;
    // highRenderer.gammaOutput = true;
    // highRenderer.gammaFactor = 2.2;

    /////


    /////////////////////
    ///   MISC
    /////////////////////

    clock = new THREE.Clock();

    gltfLoader = new THREE.GLTFLoader();
    var dracoLoader = new THREE.DRACOLoader();

    dracoLoader.setDecoderPath( 'libs/draco/' )
    gltfLoader.setDRACOLoader( dracoLoader );

    textureLoader = new THREE.TextureLoader();
    fileLoader = new THREE.FileLoader()


    // TEMP
    // datGUI = new dat.GUI();


    input = Input();
    stamina = Stamina();
    interaction = Interaction();
    dynamicItems = DynamicItems();
    mapManager = MapManager();
    optimizer = Optimizer();
    gameState = GameState();


    loop();

};