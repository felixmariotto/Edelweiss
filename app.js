
const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 5050;
var geoip = require('geoip-lite');

const { Pool } = require('pg');
const POOL = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});





/////////////////
///  APP
/////////////////


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

	var lang = client.handshake.headers['accept-language'].split(",")[0];

	var ip = client.handshake.headers["x-forwarded-for"].split(",")[0] ;

	var geo = geoip.lookup( ip );

	// console.log( `User ${ client.id } connected` );

	var clientID;

	var startTime = Date.now();

	var postgresClient = await POOL.connect();

	postgresClient.query( `INSERT INTO analytics (
							environment,
							game_version,
							timestamp,
							ip,
							country,
							language
						   ) VALUES (
						    '${ process.env.ENVIRONMENT }',
						    '${ process.env.VERSION || 'undefined' }',
						    NOW(),
						    '${ ip }',
						    '${ geo.country }',
						    '${ lang }'
						   ) RETURNING id` ).then( (value)=> {

							clientID = value.rows[ 0 ].id ; // clientID is a number

						   });

	postgresClient.release();

	//

	client.on( 'init', async (message)=> {

		var postgresClient = await POOL.connect();

		postgresClient.query( `UPDATE analytics SET
								browser = '${ message.browser }',
								browser_version = '${ message.browser_version }',
								local_time = '${ message.time }'
							   WHERE id = ${ clientID }` );

		postgresClient.release();

	});

	//

	client.on( 'bonus', async (message)=> {

		var postgresClient = await POOL.connect();

		postgresClient.query( `UPDATE analytics
							   SET bonuses = array_append( bonuses, '${ message }' )
							   WHERE id = ${ clientID }` );

		postgresClient.release();

	});

	//

	client.on( 'dialogue', async (message)=> {

		var postgresClient = await POOL.connect();

		postgresClient.query( `UPDATE analytics
							   SET dialogues = array_append( dialogues, '${ message }' )
							   WHERE id = ${ clientID }` );

		postgresClient.release();

	});

	//

	client.on( 'save', async (message)=> {

		var postgresClient = await POOL.connect();

		postgresClient.query( `UPDATE analytics
							   SET saves = array_append( saves, '${ message }' )
							   WHERE id = ${ clientID }` );

		postgresClient.release();

	});

	//

	client.on( 'death', async (message)=> {

		var postgresClient = await POOL.connect();

		postgresClient.query( `UPDATE analytics
							   SET deaths = array_append( deaths, '${ message }' )
							   WHERE id = ${ clientID }` );

		postgresClient.release();

	});

	//

	client.on( 'touchscreen', async ()=> {

		var postgresClient = await POOL.connect();

		postgresClient.query( `UPDATE analytics
							   SET touchscreen = true
							   WHERE id = ${ clientID }` );

		postgresClient.release();

	});

	//

	client.on( 'opti', async (message)=> {

		var postgresClient = await POOL.connect();

		postgresClient.query( `UPDATE analytics
							   SET opti_levels = array_append( opti_levels, '${ message }' )
							   WHERE id = ${ clientID }` );

		postgresClient.release();

	});

	//

	client.on('playerInfo', (message)=> {

		// join the room with the requested game name
		io.sockets.sockets[ client.id ].join( message.pass );

		// record the ID created on client side.
		// when the client quit, its game ID will be broadcasted to
		// every other player in the same room.
		client.gameId = message.id ;

		// broadcast player position to every player in the same socket io "room"
		client.broadcast.to( message.pass ).emit( 'playerInfo', message );

	});

	//

	client.on( 'disconnect', async ()=> {

		console.log('///////////////////////////////////////:')

		console.log( `User ${ client.id } disconnected` );

		if ( client.rooms ) {

			console.log( 'client.rooms = true' );
			console.log(client.rooms)

			for ( let room of Object.keys(client.rooms) ) {

				console.log('room i = ' + room);

				client.broadcast.to( room ).emit( 'playerLeft', client.gameId );

			};

		};

		//

		var postgresClient = await POOL.connect();

		postgresClient.query( `UPDATE analytics SET
								duration = '${ Date.now() - startTime }'
							   WHERE id = ${ clientID }` );

		postgresClient.release();

	});

})

