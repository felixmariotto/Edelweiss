

function Interaction() {


	const domTalkContainer = document.getElementById('talk-container');
	var isTalkContainerVisible = false ;

	const domCharName = document.getElementById('talker-name-container');

	const domChar = document.getElementById('char-container');

	const domOverlay = document.getElementById('overlay');


	function interactWith( agentName ) {

		// HIDE THE TALK UI
		if ( isTalkContainerVisible ) {

			domChar.classList.remove( 'show-char' );
			domChar.classList.add( 'hide-char' );

			// Hide the talk container after hiding the characters
			setTimeout( ()=> {

				domOverlay.style.display = 'none' ;

				domTalkContainer.classList.remove( 'show-talk' );
				domTalkContainer.classList.add( 'hide-talk' );

				domCharName.classList.remove( 'show-talker-name' );
				domCharName.classList.add( 'hide-talker-name' );

			}, 300);

		// SHOW THE TALK UI
		} else {

			domOverlay.style.display = 'inherit' ;

			domTalkContainer.classList.remove( 'hide-talk' );
			domTalkContainer.classList.add( 'show-talk' );

			domCharName.classList.remove( 'hide-talker-name' );
			domCharName.classList.add( 'show-talker-name' );

			// show the characters after showing the talk container
			setTimeout( ()=> {

				domChar.classList.remove( 'hide-char' );
				domChar.classList.add( 'show-char' );

			}, 200);

		};

		isTalkContainerVisible = !isTalkContainerVisible ;

	};


	function trigger( agentName ) {

		console.log( agentName );
	};


	return {
		interactWith,
		trigger
	};

};