

function CharaAnim( player ) {


	var glider;

    const group = player.charaGroup ;


    // This is called when atlas finished loading all the assets.
    // It configures the speed of every action
    function setTimeScales() {
	    actions.gliderAction.setEffectiveTimeScale( 3 );
	    actions.run.setEffectiveTimeScale( 3 );
	    actions.climbUp.setEffectiveTimeScale( 3 );
        actions.climbDown.setEffectiveTimeScale( 3 );
        actions.climbLeft.setEffectiveTimeScale( 3 );
        actions.climbRight.setEffectiveTimeScale( 3 );
    };


    // This object stores the weight factor of each
    // climbing animation. It is updated when the user moves
    // while climbing by the function setClimbBalance.
    var climbDirectionPowers = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };

    var currentState = 'idleGround' ;
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



    
    /*
    actionsToFadeIn and actionsToFadeOut store
    objects like this :
	{
	actionName,
	targetWeight,
	fadeSpeed (between 0 and 1)
	}
	This is used in the update function to tween the
	weight of actions
    */
    var actionsToFadeIn = [];
    var actionsToFadeOut = [];





    function update( delta ) {

    	if ( actionsToFadeIn.length > 0 ) {

    		// console.log(actionsToFadeIn)

    		actionsToFadeIn.forEach( (action)=> {

    			actions[ action.actionName ].setEffectiveWeight(
	    			actions[ action.actionName ].weight + action.fadeSpeed
	    		);

	    		if ( actions[ action.actionName ].weight >=
	    			 action.targetWeight ) {

	    			actions[ action.actionName ].setEffectiveWeight( action.targetWeight );

	    			actionsToFadeIn.splice( actionsToFadeIn.indexOf( action ), 1 );
	    		};

    		});

    	};

    	if ( actionsToFadeOut.length > 0 ) {

    		// console.log(actionsToFadeOut)

    		actionsToFadeOut.forEach( (action)=> {

    			actions[ action.actionName ].setEffectiveWeight(
	    			actions[ action.actionName ].weight - action.fadeSpeed
	    		);

	    		if ( actions[ action.actionName ].weight <= 0 ) {

	    			actions[ action.actionName ].setEffectiveWeight( 0 );

	    			let prout = actionsToFadeOut.splice( actionsToFadeOut.indexOf( action ), 1 );
	    		
	    			// console.log( 'stopped ' + prout[0].actionName )
	    		};

    		});

    	};

    };




    function setFadeIn( actionName, targetWeight, fadeSpeed ) {

    	actionsToFadeIn.push({
			actionName,
			targetWeight,
			fadeSpeed
		});

    	// Delete the starting action from the fadeOut list,
    	// or it would fadein and fadeout at the same time.
		actionsToFadeOut.forEach( (action, i)=> {

			if ( action.actionName == actionName ) {
				actionsToFadeOut.splice( i, 1 );
			};

		});

    };



    function setFadeOut( actionName, fadeSpeed ) {

    	actionsToFadeOut.push({
			actionName,
			fadeSpeed
		});

		// Delete the starting action from the fadeIn list,
    	// or it would fadein and fadeout at the same time.
		actionsToFadeIn.forEach( (action, i)=> {

			if ( action.actionName == actionName ) {
				actionsToFadeIn.splice( i, 1 );
			};

		});

    };






    function setCharaRot( angle ) {

        player.charaGroup.rotation.y = angle ;

    };







    function setState( newState ) {



    	if ( currentState != newState ) {


    		// set fade-in
    		switch ( newState ) {

    			case 'runningSlow' :
    				setFadeIn( 'run', 1, 0.1 );
    				break;

    			case 'idleGround' :
    				setFadeIn( 'idle', 1, 0.1 );
    				break;

    			case 'idleClimb' :
    				setFadeIn( 'climbIdle', 1, 1 );
    				break;

    			case 'jumping' :
    				setFadeIn( 'jumbRise', 1, 1 );
    				break;

    			case 'falling' :
    				setFadeIn( 'fall', 1, 0.1 );
    				break;

    			case 'gliding' :
    				glider.visible = true ;
    				setFadeIn( 'glide', 1, 1 );
    				break;

    			case 'chargingDash' :
    				setFadeIn( 'chargeDash', 1, 1 );
    				break;

    		};




    		// set fade-out
    		switch ( currentState ) {

    			case 'idleGround' :
    				actions.idle.time = 0 ;
    				setFadeOut( 'idle', 0.1 );
    				break;

    			case 'idleClimb' :
    				setFadeOut( 'climbIdle', 1 );
    				break;

    			case 'runningSlow' :
    				setFadeOut( 'run', 0.1 );
    				break;

    			case 'jumping' :
    				setFadeOut( 'jumbRise', 0.2 );
    				break;

    			case 'falling' :
    				setFadeOut( 'fall', 1 );
    				break;

    			case 'gliding' :
    				glider.visible = false ;
    				setFadeOut( 'glide', 1 );
    				break;

    			case 'chargingDash' :
    				setFadeOut( 'chargeDash', 1 );
    				break;

    			case 'climbing' :
    				setFadeOut( 'climbUp', 0.1 );
    				setFadeOut( 'climbDown', 0.1 );
    				setFadeOut( 'climbLeft', 0.1 );
    				setFadeOut( 'climbRight', 0.1 );
    				break;

    		};



    		currentState = newState ;

    	};

    };




    // Here we need to compute the climbing direction from the
    // arguments, to balance climbing-up, climbing-right etc..
    function setClimbBalance( faceDirection, moveDirection ) {

        if ( currentState == 'climbing' ) {

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

        };


        actions.climbUp.setEffectiveWeight( climbDirectionPowers.up );
        actions.climbDown.setEffectiveWeight( climbDirectionPowers.down );
        actions.climbLeft.setEffectiveWeight( climbDirectionPowers.left );
        actions.climbRight.setEffectiveWeight( climbDirectionPowers.right );


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



    function setGlider( gliderMesh ) {
    	glider = gliderMesh ;
    	glider.visible = false ;
    };



    ///////////////////////////
    ///  ACTIONS SETTING
    ///////////////////////////


    
    function climb( faceDirection, moveDirection ) {
    	setState( 'climbing' );
        setClimbBalance( faceDirection, moveDirection );
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
    	setGlider,
    	setTimeScales,
    	update,
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