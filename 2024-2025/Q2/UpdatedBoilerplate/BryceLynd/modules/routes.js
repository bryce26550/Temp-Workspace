const sqlite3 = require('sqlite3');
const AUTH_URL = "http://172.16.3.100:420/oauth";
const THIS_URL = "http://172.16.3.235:3000/formbar-login";
const jwt = require("jsonwebtoken");
const crypto = require('crypto'); // Import the crypto module
const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

function routes(app) {

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
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
                            res.redirect('/chat');

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

app.get('/formbar-login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;

        let fb_id = req.session.token.id;
        let fb_name = req.session.user;
        let query = `SELECT * FROM FBusers WHERE fb_id = ?`;

        db.get(query, [fb_id], (err, row) => {
            if (err) {
                console.log(err);
                console.error(err);
                res.send("There was an error:\n" + err)
            } else if (row) {
                req.session.user = fb_name; // Ensure session is set
                console.log("User found in FBusers, redirecting to chat");
                res.redirect('/chat');
            } else {
                db.run(`INSERT INTO FBusers(fb_name, fb_id) VALUES(?, ?)`, [fb_name, fb_id], (err) => {
                    if (err) {
                        console.log(err);
                        console.error(err);
                        res.send("There was an error:\n" + err)
                    } else {
                        req.session.user = fb_name; // Ensure session is set
                        console.log("User inserted into FBusers, redirecting to chat");
                        res.redirect('/chat');
                    }
                });
            }
        });
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/chat');
        }
        res.redirect('/');
    });
});

app.get('/chat', (req, res) => {
    isAuthenticated(req, res, () => {
        console.log("Rendering chat.ejs for user:", req.session.user);
        res.render('chat.ejs', { user: req.session.user }); // Pass user to chat.ejs
    });
});
}

module.exports = { routes };