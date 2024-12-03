const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express();

app.listen(3000);

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'S3a0Fth!3v3s',
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('we good bruv')
    }
});

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/index', (req, res) => {
    res.render('index');
});

app.post('/login', (req, res) => {
    if (req.body.user && req.body.pass) {
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                console.error(err);
                res.send("There was an error:\n" + err)
            } else if (!row) {
                //create new salt for user
                const salt = crypto.randomBytes(16).toString('hex');
                //use salt to hash password
                crypto.pbkdf2(req.body.pass, salt, 1000000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password: " + err);
                    } else {
                        const hashedPassword = derivedKey.toString('hex');
                        db.run('INSERT INTO users (username, password, salt) VALUES (?,?,?);', [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send(console.log("Database error\n" + err))
                            } else {
                                res.send("Created new user")
                            }
                        });
                    }
                });

            } else {
                //compare stored password to provided password
                crypto.pbkdf2(req.body.pass, row.salt, 1000000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("error hashing password " + err)
                    } else {
                        const hashedPassword = derivedKey.toString('hex');
                        if (row.password === hashedPassword) {
                            req.session.user = req.body.user;
                            res.redirect('/index');

                        } else {
                            res.send("Incorrect password.")
                        }
                    }
                });

            }
        });
    } else {
        res.send("You need a username and password")
    }
});

app.get('/home', isAuthenticated, (req, res) => {
    db.all('SELECT * FROM posts ORDER BY timestamp ASC', (err, rows) => {
        if (err) {
            return res.send("Error fetching posts.");
        }
        res.render('home.ejs', { user: req.session.user, posts: rows });
    });
});

app.get('/chat', (req, res) => {
    res.render('chat');
});

app.post('/chat', isAuthenticated, (req, res) => {
    const { content } = req.body;
    const poster = req.session.user;

    console.log("Content:", content);
    console.log("Poster:", poster);

    db.run('INSERT INTO posts (content, poster) VALUES (?, ?)', [content, poster], function (err) {
        if (err) {
            console.error("Error saving post:", err);
            return res.send("Error saving post.");
        }
        res.redirect('/home');
    });
});