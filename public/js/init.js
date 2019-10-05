
function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xff00ff );

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth/window.innerHeight, 1, 100 );
    camera.position.set( 0, 1, 20 );
    camera.lookAt( 0, 0, 0 );

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