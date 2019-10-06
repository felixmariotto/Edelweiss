
function loop() {

    requestAnimationFrame( loop );

    renderer.render( scene, camera );

    stats.update();
    controls.update();

};