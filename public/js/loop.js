




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



    // temp
    highRenderer.render( scene, camera );


    /*
    
    if ( optimizer &&
         optimizer.params.level == 0 ) {

        highRenderer.render( scene, camera );

    } else {

        cheapRenderer.render( scene, camera );

    };

    
    
    
    



    // If performances are low,
    // reduce graphic quality to get at least 45FPS
    if ( loopCount > 60 &&
         optimizer ) {

        // console.log( optimizer.params.level )

        if ( clockDelta > optimizer.OPTFPS ) {

            optimizer.optimize( clockDelta );

        } else if ( clockDelta < optimizer.DEOPTFPS ) {

            optimizer.deOptimize( clockDelta );

        };

    };

    */






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