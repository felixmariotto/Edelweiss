
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

document.getElementById('char-container').style.height =
        `${ window.innerHeight }px`;





function onWindowResize() {

    if ( cameraControl ) cameraControl.adaptFOV() ;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	cheapRenderer.setSize( window.innerWidth, window.innerHeight );
    highRenderer.setSize( window.innerWidth, window.innerHeight );

    document.getElementById('char-container').style.height =
        `${ window.innerHeight }px`;

    if ( input.joystick ) {

        input.joystick._baseX = 85 ;
        input.joystick._baseY = window.innerHeight - 85 ;

        input.joystick._baseEl.style.top = 
            `${ window.innerHeight - ( 85 + ( input.joystick._baseEl.clientHeight / 2 ) ) }px` ;

    };

};