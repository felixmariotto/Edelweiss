
const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 5050;

const { Pool } = require('pg');
const pool = new Pool({
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



    .get('/db', async (req, res) => {
	    try {
	      const client = await pool.connect()
	      const result = await client.query('SELECT * FROM analytics');
	      const results = { 'results': (result) ? result.rows : null};
	      res.send( results );
	      client.release();
	    } catch (err) {
	      console.error(err);
	      res.send("Error " + err);
	    }
	  })



    .listen(PORT, ()=> {
        console.log('App listening on port ' + PORT);
    })








//////////////////
///  SOCKET.IO
//////////////////


const io = socketIO( app );

io.on( 'connection', (client)=> {

	console.log( `User ${ client.id } connected` );

	client.on( 'test', ( message )=> {

		console.log( 'message received : ', message );

	});

	client.on( 'disconnect', ()=> {

		console.log( `User ${ client.id } disconnected` );

	});

})

