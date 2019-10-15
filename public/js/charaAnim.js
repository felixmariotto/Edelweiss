

function CharaAnim( player ) {


    const group = player.charaGroup ;

    // This object stores the weight factor of each
    // climbing animation. It is updated when the user moves
    // while climbing by the function setClimbBalance.
    var climbDirectionPowers = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };

    var state = 'idleGround' ;
    /*

    idleGround
    idleClimb

    runningSlow
	runningFast

    climbing
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




    // Here we need to compute the climbing direction from the
    // arguments, to balance climbing-up, climbing-right etc..
    function setClimbBalance( faceDirection, moveDirection ) {

        switch ( faceDirection ) {

            case 'up' :
                setClimbDirection( 'up', Math.PI );
                setClimbDirection( 'down', 0 );
                setClimbDirection( 'left', -Math.PI / 2 );
                setClimbDirection( 'right', Math.PI / 2 );
                break;

            case 'down' :
                setClimbDirection( 'up', Math.PI );
                setClimbDirection( 'down', 0 );
                setClimbDirection( 'left', Math.PI / 2 );
                setClimbDirection( 'right', -Math.PI / 2 );
                break;

            case 'left' : 
                setClimbDirection( 'up', -Math.PI / 2 );
                setClimbDirection( 'down', Math.PI / 2 );
                setClimbDirection( 'left', 0 );
                setClimbDirection( 'right', Math.PI );
                break;

            case 'right' :
                setClimbDirection( 'up', Math.PI / 2 );
                setClimbDirection( 'down', -Math.PI / 2 );
                setClimbDirection( 'left', Math.PI );
                setClimbDirection( 'right', 0 );
                break;

        };

        console.log( climbDirectionPowers );


        // Attribute a value between 0 and 1 to a climbing animation according
        // to the difference between the requested angle and the target angle
        // that would make this action 100% played
        function setClimbDirection( directionName, target ) {

            climbDirectionPowers[ directionName ] = Math.max(
                    ( 1 -
                    ( Math.abs( utils.minDiffRadians( target, moveDirection ) ) /
                    (Math.PI / 2) )
                    )
            , 0 );

        };

    };





    ///////////////////////////
    ///  ACTIONS SETTING
    ///////////////////////////


    
    function climb( faceDirection, moveDirection ) {
        setClimbBalance( faceDirection, moveDirection );
    	setState( 'climbing' );
    };


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
        climb,
        idleGround,
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