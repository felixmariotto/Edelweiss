
function Input() {


    // Movement
    var moveKeys = [];
    var tempDirArray ;

    var params = {
        isSpacePressed: false
    };




    /////////////////////
    ///   IMPORT JSON
    /////////////////////


    var hashTable = {
        true: '$t',
        false: '$f',
        position: '$p',
        type: '$k',
        points: '$v',
        isWall: '$w',
        isXAligned: '$i',
        'ground-basic': '$g',
        'ground-start': '$s',
        'wall-limit': '$l',
        'wall-easy': '$e',
        'wall-medium' : '$m',
        'wall-hard': '$h',
        'wall-fall': '$a',
        'wall-slip': '$c',
        'cube-inert': '$r',
        'cube-interactive': '$q',
        'cube-trigger': '$o'
    };


    function parseJSON( data ) {

        for ( let valueToReplace of Object.keys( hashTable ) ) {

            text = hashTable[ valueToReplace ]
            text = text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

            data = data.replace( new RegExp( text , 'g' ), valueToReplace );

        };

        return JSON.parse( data ) ;
    };


    document.getElementById('json-scene').addEventListener('click', ()=> {
        document.getElementById('json-scene').blur();
    });

    document.getElementById('json-scene').onchange = function (evt) {

        var tgt = evt.target || window.event.srcElement,
            files = tgt.files;
    
        // FileReader support
        if (FileReader && files && files.length) {

            var fr = new FileReader();

            fr.onload = function () {

                let data = lzjs.decompress( fr.result );

                let sceneGraph = parseJSON( data );

                // Initialize atlas with the scene graph
                atlas = Atlas( sceneGraph );
            };

            fr.readAsText(files[0]);

        };

    };



    window.addEventListener( 'keydown', (e)=> {

        // console.log( e.code );

        switch( e.code ) {

            case 'Escape' :
                console.log('press escape');
                break;

            case 'Space' :
                params.isSpacePressed = true ;
                break;

            case 'ArrowLeft' :
                addMoveKey( 'left' );
                break;

            case 'ArrowUp' :
                addMoveKey( 'up' );
                break;

            case 'ArrowRight' :
                addMoveKey( 'right' );
                break;

            case 'ArrowDown' :
                addMoveKey( 'down' );
                break;

        };
        
    }, false);



    window.addEventListener( 'keyup', (e)=> {

        switch( e.code ) {

            case 'ArrowLeft' :
                removeMoveKey( 'left' );
                break;

            case 'ArrowUp' :
                removeMoveKey( 'up' );
                break;

            case 'ArrowRight' :
                removeMoveKey( 'right' );
                break;

            case 'ArrowDown' :
                removeMoveKey( 'down' );
                break;

            case 'Space' :
                releaseSpace();
                break;

        };

    });







    function removeMoveKey( keyString ) {
        moveKeys.splice( moveKeys.indexOf( keyString ), 1 );
        sendMoveDirection();
    };




    function addMoveKey( keyString ) {

        if ( interaction.isInDialogue() ) {

            interaction.chooseAnswer( keyString );

        } else if ( moveKeys.indexOf( keyString ) < 0 ) {

            moveKeys.unshift( keyString );
            sendMoveDirection();

        };
        
    };



    function sendMoveDirection() {

        tempDirArray = [ moveKeys[0], moveKeys[1] ];

        if ( !tempDirArray[0] ) { // no movement

            controler.setMoveAngle( false );

        } else if ( !tempDirArray[1] ) { // orthogonal movement

            if ( tempDirArray[0] == 'left' ) {

                controler.setMoveAngle( true, -Math.PI / 2 );
            };

            if ( tempDirArray[0] == 'up' ) {

                controler.setMoveAngle( true, Math.PI );
            };

            if ( tempDirArray[0] == 'right' ) {

                controler.setMoveAngle( true, Math.PI / 2 );
            };

            if ( tempDirArray[0] == 'down' ) {

                controler.setMoveAngle( true, 0 );
            };

        } else { // diagonal movement

            if ( tempDirArray.indexOf( 'left' ) > -1 &&
                tempDirArray.indexOf( 'up' ) > -1 ) {

                controler.setMoveAngle( true, (-Math.PI / 4) * 3 );
            };

            if ( tempDirArray.indexOf( 'right' ) > -1 &&
                tempDirArray.indexOf( 'up' ) > -1 ) {

                controler.setMoveAngle( true, (Math.PI / 4) * 3 );
            };

            if ( tempDirArray.indexOf( 'right' ) > -1 &&
                tempDirArray.indexOf( 'down' ) > -1 ) {

                controler.setMoveAngle( true, Math.PI / 4 );
            };

            if ( tempDirArray.indexOf( 'left' ) > -1 &&
                tempDirArray.indexOf( 'down' ) > -1 ) {

                controler.setMoveAngle( true, -Math.PI / 4 );
            };

            // Contradictory inputs :
            // the last input is sent to atlas :

            if ( tempDirArray.indexOf( 'up' ) > -1 &&
                tempDirArray.indexOf( 'down' ) > -1 ) {

                controler.setMoveAngle( true, tempDirArray[0] == 'up' ? Math.PI : 0 );
            };

            if ( tempDirArray.indexOf( 'left' ) > -1 &&
                tempDirArray.indexOf( 'right' ) > -1 ) {

                controler.setMoveAngle( true, tempDirArray[0] == 'right' ? Math.PI / 2 : -Math.PI / 2 );
            };

        };

    };





    function releaseSpace() {

        if ( interaction.isInDialogue() ) {

            interaction.requestNextLine();

        } else {

            controler.spaceInput();

        };
        
        params.isSpacePressed = false ;
    };







    return {
        params,
        moveKeys
    };

};