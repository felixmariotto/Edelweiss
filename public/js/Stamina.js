
function Stamina() {

    const domBar = document.getElementById('stamina-bar');

    const STARTSTAMINA = 2 ; // max 9
    const TOLERANCE = 0.2 ;

    var params = {
        stamina: 0,
        maxStamina: 0,
        playerKnowsStamina: false
    };

    var gauges = [];

    //// INIT

    // Create a stamina section for each level
    for ( let i=0 ; i < STARTSTAMINA ; i++ ) {
        incrementMaxStamina();
    };

    function incrementMaxStamina() {

        let divSection = document.createElement('DIV');
        divSection.classList.add('stamina-section');
        domBar.append( divSection );

        let divGauge = document.createElement('DIV');
        divGauge.classList.add('stamina-gauge');
        divSection.append( divGauge );

        gauges.unshift( divGauge );

        params.stamina = gauges.length ;
        params.maxStamina = gauges.length ; 

        // Make the "new" section blink (in fact, the first one).
        if ( clock.elapsedTime > 5 ) {

            let sections = document.querySelectorAll( '.stamina-section' );

            sections[ 0 ].classList.remove( 'show-stamina' );

            setTimeout( ()=> {
                sections[ 0 ].classList.add( 'show-stamina' );
            }, 100);

        };
        
    };

    //

    function update( mustUpdateDom ) {

        if ( mustUpdateDom ) {

            updateDom();

        };

    };

    ///////////////////////////
    // DOM STAMINA BAR UPDATE
    ///////////////////////////

    function updateDom() {

        gauges.forEach( ( domGauge, i )=> {

            let a = ( ( params.stamina * ( params.maxStamina + TOLERANCE ) ) / params.maxStamina ) - i - TOLERANCE ;
            let b = Math.max( Math.min( a, 1 ), 0 );
            domGauge.style.width = `${ b * 100 }%` ;

            // domGauge.style.width = `${ Math.max( Math.min( params.stamina - i, 1 ), 0 ) * 100 }%` ;

        });

    };

    /////////////////////////////////
    ///  STAMINA LEVEL OPERATIONS
    /////////////////////////////////

    // Called by the controler module when player make movements
    function reduceStamina( factor, update ) {

        params.stamina -= factor ;

        // Check if stamina is bellow 0 + tolerance
        if ( ( params.stamina * params.maxStamina ) / ( params.maxStamina - TOLERANCE ) < TOLERANCE ) {

            // make stamina bar UI blink
            domBar.classList.add( 'blink-stamina' );

            let domSections = document.querySelectorAll('.stamina-section');

            domSections.forEach( (domSection)=> {

                domSection.style.backgroundColor = '#c7001e' ;

            });

        };

        if ( params.stamina < 0 ) {

            params.stamina = 0 ;

            if ( !params.playerKnowsStamina ) {

                params.playerKnowsStamina = true ;

                interaction.showMessage( 'Out of stamina ! <br> Go back on the ground' );

            };

        };

        if ( update ) {

            updateDom();

        };

    };

    // Called by Controler when the user is on the ground,
    // so the user regain all their stamina and can start
    // climbing again
    function resetStamina() {

        if ( params.stamina != params.maxStamina ) {

            domBar.classList.remove( 'blink-stamina' );

            let domSections = document.querySelectorAll('.stamina-section');

            domSections.forEach( (domSection)=> {

                domSection.style.backgroundColor = 'rgba(153, 228, 78, 0.294)' ;

            });

        };

        params.stamina = params.maxStamina ;

    };

    //

    return {
        params,
        reduceStamina,
        resetStamina,
        incrementMaxStamina,
        update
    };

};