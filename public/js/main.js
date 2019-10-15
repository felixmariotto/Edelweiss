
var scene, camera, renderer, stats, input, atlas,
    controls, controler, clock, datGUI, charaAnim,
    gltfLoader, mixer ;

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