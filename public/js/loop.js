




var loopCount = 0 ;




function loop() {



	loopCount += 1 ;

    clockDelta = clock.getDelta();


    requestAnimationFrame( loop );
    
    /*
    setTimeout( function() {

        requestAnimationFrame( loop );

    }, 1000 / 30 );
    */


    if ( optimizer ) {

        optimizer.cheapRenderer.render( scene, camera );

    } else {

        renderer.render( scene, camera );

    };
    



    // If performances are low,
    // reduce graphic quality to get at least 45FPS
    if ( loopCount % 25 == 0 ) {

        if ( clockDelta > 1 / 45 ) {

            console.log('optimize')

        };

    };



    stats.update();
    if ( orbitControls ) orbitControls.update();

    if ( controler ) controler.update( clockDelta );
    if ( mixer ) mixer.update( clockDelta );
    if ( charaAnim ) charaAnim.update( clockDelta );
    if ( dynamicItems ) dynamicItems.update( clockDelta );
    if ( input ) input.update( clockDelta );

    if ( cameraControl ) cameraControl.update( loopCount % 10 == 0 );
    if ( stamina ) stamina.update( loopCount % 10 == 0 );
    if ( mapManager ) mapManager.update( loopCount % 10 == 0 );

};