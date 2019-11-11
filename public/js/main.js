
var scene, camera, stats, input, atlas,
    orbitControls, controler, clock, datGUI, charaAnim,
    gltfLoader, mixer, cameraControl, stamina, interaction,
    dynamicItems, textureLoader, fileLoader, mapManager,
    optimizer ;

var renderer, highRenderer, cheapRenderer ;

var actions = [];

var utils = Utils();
var easing = Easing();

/*
var GUIControler = {
    gliding: true,
    infinityJump: true,
    dash: true
}; */

var clockDelta ;

window.addEventListener('load', ()=> {
    init();
});

window.addEventListener( 'resize', onWindowResize, false );







function onWindowResize() {

    if ( cameraControl ) cameraControl.adaptFOV() ;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	cheapRenderer.setSize( window.innerWidth, window.innerHeight );
    highRenderer.setSize( window.innerWidth, window.innerHeight );

};