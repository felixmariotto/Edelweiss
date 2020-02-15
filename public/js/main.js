
var scene, camera, stats, input, atlas,
    orbitControls, controler, clock, datGUI, charaAnim,
    gltfLoader, mixer, cameraControl, stamina, interaction,
    dynamicItems, textureLoader, fileLoader, mapManager,
    socketIO, optimizer, uaParser, gameState, feedback,
    assetManager, soundMixer ;

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
    init();
});

window.addEventListener( 'resize', onWindowResize, false );





function onWindowResize() {

    if ( cameraControl ) cameraControl.adaptFOV() ;

    let world = document.getElementById( 'black-screen' );

	camera.aspect = world.clientWidth / world.clientHeight;
	camera.updateProjectionMatrix();

    renderer.setSize( world.clientWidth, world.clientHeight );

    //

    composer.setSize( world.clientWidth, world.clientHeight );

    var pixelRatio = renderer.getPixelRatio();

    fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( world.clientWidth * pixelRatio );
    fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( world.clientHeight * pixelRatio );

    //

    if ( input.joystick ) {

        document.getElementById( 'cross' ).style.top =
                            `${ world.clientHeight - 127.5 }px` ;
                           

        input.joystick._baseX = 90 ;
        input.joystick._baseY = world.clientHeight - 90 ;

        input.joystick._baseEl.style.top = 
            `${ world.clientHeight - ( 90 + ( input.joystick._baseEl.clientHeight / 2 ) ) }px` ;

    };

};