
const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 5050;


///////////
///  APP
///////////

const app = express()

	.use(express.static('public'))

    .get('/', (req, res)=> {
        res.sendFile(path.join(__dirname + '/public/index.html'));
    })

    .listen(PORT, ()=> {
        console.log('App listening on port ' + PORT);
    })


//////////////////
///  SOCKET.IO
//////////////////

const io = socketIO( app );

io.on( 'connection', async (client)=> {

	client.on('playerInfo', (message)=> {

		// join the room with the requested game name
		io.sockets.sockets[ client.id ].join( message.pass );

		client.roomId = message.pass ;

		// record the ID created on client side.
		// when the client quit, its game ID will be broadcasted to
		// every other player in the same room.
		client.gameId = message.id ;

		// broadcast player position to every player in the same socket io "room"
		client.broadcast.to( message.pass ).emit( 'playerInfo', message );

	});

	//

	client.on( 'disconnect', async ()=> {

		// broadcast the disconnection information to the other
		// players of the same room
		if ( client.roomId ) {

			client.broadcast.to( client.roomId ).emit( 'playerLeft', client.gameId );

		};

	});

})
