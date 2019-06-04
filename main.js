//SQL statements
const SQL_SELECT_FILM = 'select film_id, title, description from film limit 20';
const SQL_SELECT_FILM_WHERE = 'select film_id, title, description from film WHERE TITLE LIKE ?';

const SQL_SELECT_FILM_PAGE = 'select film_id, title, description from film limit ? offset ?';
const SQL_SELECT_FILM_WHERE_PAGE = 
    'select film_id, title, description from film where title like ? limit ? offset ?';

const SQL_SELECT_FILM_WHERE_PAGE_COUNT = 
    'select COUNT(*) from film where title like ?';
    

//Load the libraries
const express = require('express');
const hbs = require('express-handlebars');
const mysql = require('mysql');

//Configure PORT
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || 3000);

//Create an MySQL connection pool
const pool = mysql.createPool(require('./config.json'));

//Create an instance of the application
const app = express();

//configure handlebars
app.engine('hbs', hbs() );
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.get('/search', (req, resp) => {
    const q = req.query.q;
    console.log('q: ', q);
    pool.getConnection((err, conn) => {
        if (err) {
            resp.status(500);
            resp.type('text/plain');
            resp.send(err);
            return;
        }
        conn.query(SQL_SELECT_FILM_WHERE_PAGE ,
            [`%${q}%`, 5,0],
            (err, result) => {
                //conn.release();
            if (err) {
                resp.status(500);
                resp.type('text/plain');
                resp.send(err);
                return;
            }
+
            console.log("a");
            
            var isEmpty;
            if(result.length == 0)
                isEmpty = true;
            else
                isEmpty = false;
                
                let numOfRecords;
            conn.query(SQL_SELECT_FILM_WHERE_PAGE_COUNT ,
                [`%${q}%`],
                (erro, recordcount) => {
                    conn.release();
                    //console.log(recordcount[0]);
                    console.log(JSON.parse(JSON.stringify(recordcount).replace('(*)',''))[0].COUNT);

                    numOfRecords = JSON.parse(JSON.stringify(recordcount).replace('(*)',''))[0].COUNT;
                
            

            resp.status(200);
            resp.type('text/html')
            resp.render('movies', {
                movies:result, layout:false,
                NoResults: isEmpty,
                count: numOfRecords
             });
            })
            // resp.status(200);
            // resp.send(result);
        })
    });
})

app.get(/.*/, express.static(__dirname + '/public'))
app.get(/.*/, express.static(__dirname + '/views'))

app.listen(PORT, () => {
    console.info(`Movie DB Application started on port ${PORT} at ${new Date()}`);
});