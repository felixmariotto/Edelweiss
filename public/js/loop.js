
function loop() {

    requestAnimationFrame( loop );

    renderer.render( scene, camera );

    stats.update();
    controls.update();

    clockDelta = clock.getDelta();

    if ( controler ) controler.update( clockDelta );
    if ( mixer ) mixer.update( clockDelta );

};