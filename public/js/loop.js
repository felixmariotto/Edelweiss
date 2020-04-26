
var loopCount = 0 ;
var ticks, clockDelta;

function loop() {

	loopCount += 1 ;

    clockDelta = clock.getDelta();

    requestAnimationFrame( loop );

    // If performances are low,
    // reduce graphic quality to get at least 45FPS
    if ( !gameState.params.isGamePaused && optimizer ) {

        optimizer.update( clockDelta );

    };

    //

    if ( optimizer &&
         optimizer.params.level <= 1 ) {

        composer.render();

    } else if ( optimizer ) {

        renderer.render( scene, camera );

    };

    // UPDATE LOGIC
    
    if ( controler && cameraControl && atlas.getSceneGraph() ) {

        ticks = Math.round( ( clockDelta / ( 1 / 60 ) ) * 2 );

        for ( let i = 0 ; i < ticks ; i++ ) {

            controler.update( clockDelta / ticks );

        };

        cameraControl.update( clockDelta / ( 1 / 60 ) );

    };

    // MISC UPDATES

    for ( let key in characterAnimations ) characterAnimations[ key ].update( clockDelta );
    if ( assetManager ) assetManager.update( clockDelta );

    if ( charaAnim ) charaAnim.update( clockDelta );
    if ( input ) input.update( clockDelta );
    if ( stamina ) stamina.update( loopCount % 10 == 0 );
    if ( mapManager ) mapManager.update( loopCount % 10 == 0 );

    if ( gameState ) {

        gameState.update( loopCount % 15 == 0 );

        if ( !gameState.params.isGamePaused ) {
            if ( soundMixer ) soundMixer.update( loopCount % 15 == 0, clockDelta );
            if ( atlas ) atlas.debugUpdate( loopCount % 15 == 0 );
        };
    };
};
