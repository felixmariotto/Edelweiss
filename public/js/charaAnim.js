

function CharaAnim( player ) {


    const group = player.charaGroup ;

    var state = 'idleGround' ;
    /*

    idleGround
    idleClimb

    runningSlow
	runningFast

    climbingUp
    slipping
    
    gliding
    jumping
    falling

    dashing
    chargingDash

    haulingDown
    haulingUp
    switchInward
    switchOutward
    pullingUnder

    */





    function setCharaRot( angle ) {

        player.charaGroup.rotation.y = angle ;

    };



    function setState( stateName ) {

    	if ( state != stateName ) {

    		state = stateName ;

    		console.log( stateName );
    		// actions.run.play();

    	};

    };



    ///////////////////////////
    ///  ACTIONS SETTING
    ///////////////////////////


    function runSlow() {
    	setState( 'runningSlow' ); // could use inertia value to apply weight ?
    };


    function runFast() {
    	setState( 'runningFast' );
    };


    function idleClimb() {
    	setState( 'idleClimb' );
    };


    function idleGround() {
    	setState( 'idleGround' );
    };


    function climbUp() {
    	setState( 'climbingUp' );
    };


    function glide() {
        setState('gliding');
    };


    function dash() {
        setState('dashing');
    };


    function chargeDash() {
        setState('chargingDash');
    };


    function jump() {
        setState('jumping');
    };


    function fall() {
        setState('falling');
    };


    function slip() {
        setState('slipping');
    };


    function haulDown() {
        setState('haulingDown');
    };


    function haulUp() {
        setState('haulingUp');
    };


    function switchOutward() {
        setState('switchingOutward');
    };


    function switchInward() {
        setState('switchingInward');
    };


    function pullUnder() {
        setState('pullingUnder');
    };


    


    return {
        setCharaRot,
        group,
        runSlow,
        runFast,
        idleClimb,
        idleGround,
        climbUp,
        glide,
        dash,
        chargeDash,
        jump,
        fall,
        slip,
        haulDown,
        haulUp,
        switchOutward,
        switchInward,
        pullUnder
    };

};