
var scene, camera, renderer, stats, input, atlas,
    controls, controler, clock, datGUI ;

var utils = Utils();

var GUIControler = {
    gliding: true,
    doubleJump: true,
    dash: true
};

var clockDelta ;

window.addEventListener('load', ()=> {
    init();
});