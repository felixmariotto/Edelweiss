
var scene, camera, stats, input, atlas,
    orbitControls, controler, clock, datGUI, charaAnim,
    gltfLoader, mixer, cameraControl, stamina, interaction,
    dynamicItems, textureLoader, fileLoader, mapManager,
    optimizer, gameState ;

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

    if ( input.joystick ) {

        document.getElementById( 'cross' ).style.top =
                            `${ window.innerHeight - 127.5 }px` ;
                           

        input.joystick._baseX = 90 ;
        input.joystick._baseY = window.innerHeight - 90 ;

        input.joystick._baseEl.style.top = 
            `${ window.innerHeight - ( 90 + ( input.joystick._baseEl.clientHeight / 2 ) ) }px` ;

    };

};