


function Interaction() {


	const domTalkContainer = document.getElementById('talk-container');
	var isInAnim = false ;

	const domTextContainer = document.getElementById( 'text-container' );

	const domCharName = document.getElementById('talker-name-container');

	const domChar = document.getElementById('char-container');

	const domOverlay = document.getElementById('overlay');

	var currentDialogue ;
	var currentLine ;
	var lastDialogueDate = Date.now();

	const DIALOGUEBREAKTIME = 1000 ; // time in ms to wait between dialogues



	function isInDialogue() {
		return currentDialogue ? true : false ;
	};





	///////////////////////////////
	///	   TRIGGERS  (BONUS, ETC..)
	///////////////////////////////


	function trigger( agentName ) {

		console.log( agentName );
	};










	///////////////////////
	///    DIALOGUE UI
	///////////////////////




	// HIDE THE TALK UI
	function hideDialogueUI() {

		if ( isInAnim ) return

		isInAnim = true ;

		domChar.classList.remove( 'show-char' );
		domChar.classList.add( 'hide-char' );

		// Hide the talk container after hiding the characters
		setTimeout( ()=> {

			domOverlay.style.display = 'none' ;

			domTalkContainer.classList.remove( 'show-talk' );
			domTalkContainer.classList.add( 'hide-talk' );

			domCharName.classList.remove( 'show-talker-name' );
			domCharName.classList.add( 'hide-talker-name' );

			isInAnim = false ;

		}, 300);

	};




	// SHOW THE TALK UI
	function showDialogueUI() {

		if ( isInAnim ) return

		isInAnim = true ;

		domOverlay.style.display = 'inherit' ;

		domTalkContainer.classList.remove( 'hide-talk' );
		domTalkContainer.classList.add( 'show-talk' );

		domCharName.classList.remove( 'hide-talker-name' );
		domCharName.classList.add( 'show-talker-name' );

		// show the characters after showing the talk container
		setTimeout( ()=> {

			domChar.classList.remove( 'hide-char' );
			domChar.classList.add( 'show-char' );

			isInAnim = false ;

		}, 200);

	};













	///////////////////////////
	///     INTERACTIONS
	///////////////////////////


	function interactWith( agentName ) {

		switch ( agentName ) {

			case 'char-dad' :
				startDialogue( 'hello-dad' );
				break;

		};

	};









	





	//////////////////////
	///    DIALOGUES
	//////////////////////


	function startDialogue( dialogueName ) {

		if ( lastDialogueDate < Date.now() - DIALOGUEBREAKTIME ) {

			showDialogueUI();

			currentDialogue = dialogueName ;
			currentLine = 0 ;

			executeDialogue();

		};

	};




	function endDialogue() {

		hideDialogueUI();

		clearLines();

		currentDialogue = undefined ;
		currentLine = undefined ;

		lastDialogueDate = Date.now();

	};




	function requestNextLine() {

		currentLine ++ ;

		if ( currentLine >= dialogues[ currentDialogue ].story.length ) {

			endDialogue();

		} else {

			executeDialogue();

		};

	};




	function executeDialogue() {

		if ( currentDialogue && currentLine != undefined ) {

			let line = dialogues[ currentDialogue ].story[ currentLine ] ;

			clearLines();

			if ( line.m ) {

				printMessage( line.m );

			} else if ( line.question ) {

				printQuestion( line );

			};

		};

	};



	function clearLines() {
		domTextContainer.innerHTML = '';
	};



	function printMessage( string ) {
		domTextContainer.innerHTML = string ;
	};



	function printQuestion( line ) {
		printMessage( line.question );
	};





	var dialogues = {

		'hello-dad' : {
			char: 'Dad',
			story: [
				{ m: 'Hi !' },
				{ m: 'How are you today ?' },
				{ question: 'Can you help me ?', answers: [
					{ m: 'Yes', next: 'help_yes' },
					{ m: 'No', next: 'help_no' }
				]},
				{ label: 'help_yes', m: 'Bring me an apple' },
				{ label: 'help_no', m: 'I never liked you' },
				{ m: 'Goodbye' }
			]
		}

	}



	








	return {
		interactWith,
		trigger,
		isInDialogue,
		requestNextLine
	};

};