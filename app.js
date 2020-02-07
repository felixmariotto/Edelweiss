
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5050;

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});


app.use(express.static('public'));

app
    .get('/', (req, res)=> {
        res.sendFile(path.join(__dirname + '/public/index.html'));
    })



    .get('/db', async (req, res) => {
	    try {
	      const client = await pool.connect()
	      const result = await client.query('SELECT * FROM analytics');
	      const results = { 'results': (result) ? result.rows : null};
	      res.render('pages/db', results );
	      client.release();
	    } catch (err) {
	      console.error(err);
	      res.send("Error " + err);
	    }
	  })



    .listen(PORT, ()=> {
        console.log('App listening on port ' + PORT);
    })