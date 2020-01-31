
var scene, camera, stats, input, atlas,
    orbitControls, controler, clock, datGUI, charaAnim,
    gltfLoader, mixer, cameraControl, stamina, interaction,
    dynamicItems, textureLoader, fileLoader, mapManager,
    optimizer, gameState, feedback, assetManager ;

var renderer, composer, fxaaPass ;

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

    /*

    feedback = Feedback();
    feedback.setMessage(
        "Hi ! I need your feedback to improve my game. White you're playing, if you have any comment, suggestion, declaration of love, or death threat, please use the banana button at the top left of your screen to send me a message."
    );

    */

    init();

});

window.addEventListener( 'resize', onWindowResize, false );





function onWindowResize() {

    if ( cameraControl ) cameraControl.adaptFOV() ;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    //

    composer.setSize( window.innerWidth, window.innerHeight );

    var pixelRatio = renderer.getPixelRatio();

    fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
    fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );

    //

    if ( input.joystick ) {

        document.getElementById( 'cross' ).style.top =
                            `${ window.innerHeight - 127.5 }px` ;
                           

        input.joystick._baseX = 90 ;
        input.joystick._baseY = window.innerHeight - 90 ;

        input.joystick._baseEl.style.top = 
            `${ window.innerHeight - ( 90 + ( input.joystick._baseEl.clientHeight / 2 ) ) }px` ;

    };

};