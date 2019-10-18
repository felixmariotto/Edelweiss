
function loop() {

    requestAnimationFrame( loop );

    renderer.render( scene, camera );

    stats.update();
    if ( orbitControls ) orbitControls.update();

    clockDelta = clock.getDelta();

    if ( controler ) controler.update( clockDelta );
    if ( mixer ) mixer.update( clockDelta );
    if ( charaAnim ) charaAnim.update( clockDelta );

};