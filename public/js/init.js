
function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x222222 );

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth/window.innerHeight, 1, 100 );
    camera.position.set( 0, 1, 20 );
    camera.lookAt( 0, 0, 0 );

    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
	scene.add( ambientLight );

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	directionalLight.position.set( 0.24, 0.78, 0.56 );
	scene.add( directionalLight );

    stats = new Stats();
    document.body.appendChild( stats.dom );
    
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('world'),
        antialias: true
    });
    renderer.setSize( window.innerWidth, window.innerHeight );


    input = Input();


    loop();

};