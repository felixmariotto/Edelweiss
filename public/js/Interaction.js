

function Interaction() {


	const domTalkContainer = document.getElementById('talk-container');
	var isTalkContainerVisible = false ;

	const domRightChar = document.getElementById('right-char');
	const domLeftChar = document.getElementById('left-char');


	function interactWith( agentName ) {

		// HIDE THE TALK UI
		if ( isTalkContainerVisible ) {

			domRightChar.classList.remove( 'show-right-char' );
			domRightChar.classList.add( 'hide-right-char' );

			domLeftChar.classList.remove( 'show-left-char' );
			domLeftChar.classList.add( 'hide-left-char' );

			// Hide the talk container after hiding the characters
			setTimeout( ()=> {

				domTalkContainer.classList.remove( 'show-talk' );
				domTalkContainer.classList.add( 'hide-talk' );

			}, 300);

		// SHOW THE TALK UI
		} else {

			domTalkContainer.classList.remove( 'hide-talk' );
			domTalkContainer.classList.add( 'show-talk' );

			// show the characters after showing the talk container
			setTimeout( ()=> {

				domRightChar.classList.remove( 'hide-right-char' );
				domRightChar.classList.add( 'show-right-char' );

				domLeftChar.classList.remove( 'hide-left-char' );
				domLeftChar.classList.add( 'show-left-char' );

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