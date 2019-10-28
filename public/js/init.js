
function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x222222 );

    // temp
    // scene.overrideMaterial = new THREE.MeshNormalMaterial();

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.2, 40 );

    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.45 );
	scene.add( ambientLight );

    stats = new Stats();
    document.body.appendChild( stats.dom );
    
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('world'),
        antialias: true
    });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true ;

    
    clock = new THREE.Clock();

    gltfLoader = new THREE.GLTFLoader();
    var dracoLoader = new THREE.DRACOLoader();

    dracoLoader.setDecoderPath( 'libs/draco/' )
    gltfLoader.setDRACOLoader( dracoLoader );

    textureLoader = new THREE.TextureLoader();
    fileLoader = new THREE.FileLoader()


    // TEMP
    datGUI = new dat.GUI();


    input = Input();
    stamina = Stamina();
    interaction = Interaction();
    dynamicItems = DynamicItems();
    mapManager = MapManager();


    loop();

};