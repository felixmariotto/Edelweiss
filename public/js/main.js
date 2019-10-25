
var scene, camera, renderer, stats, input, atlas,
    orbitControls, controler, clock, datGUI, charaAnim,
    gltfLoader, mixer, cameraControl, stamina, interaction,
    dynamicItems ;

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