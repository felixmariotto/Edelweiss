
var scene, camera, renderer, stats, input, atlas,
    orbitControls, controler, clock, datGUI, charaAnim,
    gltfLoader, mixer, cameraControl, stamina, interaction,
    dynamicItems, textureLoader, fileLoader, mapManager,
    optimizer ;

var actions = [];

var utils = Utils();
var easing = Easing();

var GUIControler = {
    gliding: true,
    infinityJump: true,
    dash: true
};

var clockDelta ;

window.addEventListener('load', ()=> {
    init();
});

window.addEventListener( 'resize', onWindowResize, false );


function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	if ( optimizer ) {
		optimizer.cheapRenderer.setSize( window.innerWidth, window.innerHeight );
	};
};