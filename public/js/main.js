
var scene, camera, renderer, stats, input, atlas,
    orbitControls, controler, clock, datGUI, charaAnim,
    gltfLoader, mixer, cameraControl ;

var actions = [];

var utils = Utils();

var GUIControler = {
    gliding: true,
    infinityJump: true,
    dash: true
};

var clockDelta ;

window.addEventListener('load', ()=> {
    init();
});