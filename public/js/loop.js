

var loopCount = 0 ;

function loop() {

	loopCount += 1 ;

    requestAnimationFrame( loop );

    renderer.render( scene, camera );

    stats.update();
    if ( orbitControls ) orbitControls.update();

    clockDelta = clock.getDelta();

    if ( controler ) controler.update( clockDelta );
    if ( mixer ) mixer.update( clockDelta );
    if ( charaAnim ) charaAnim.update( clockDelta );
    if ( dynamicItems ) dynamicItems.update( clockDelta );

    if ( cameraControl ) cameraControl.update( loopCount % 10 == 0 );
    if ( stamina ) stamina.update( loopCount % 10 == 0 );
    if ( mapManager ) mapManager.update( loopCount % 10 == 0 );

};