
var scene, camera, renderer, stats, input, atlas,
    orbitControls, controler, clock, datGUI, charaAnim,
    gltfLoader, mixer, cameraControl, stamina, interaction,
    dynamicItems, textureLoader, fileLoader, mapManager ;

var actions = [];

var utils = Utils();
var easing = Easing();

var GUIControler = {
    gliding: true,
    infinityJump: true,
    dash: true
};

var joystick = new VirtualJoystick({
	container: document.getElementById('world'),
});

var clockDelta ;

window.addEventListener('load', ()=> {
    init();
});