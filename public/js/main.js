
var scene, camera, renderer, stats, input, atlas,
    controls, controler, clock ;

var utils = Utils();

var clockDelta ;

window.addEventListener('load', ()=> {
    init();
});