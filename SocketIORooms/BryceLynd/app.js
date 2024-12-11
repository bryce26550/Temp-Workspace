const ejs = require("ejs");
const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const app = express();
const fs = require("fs");
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { error, profile } = require("console");
const port = 3000;
const AUTH_URL = 'http://172.16.3.100:420/oauth'; // ... or the address to the instance of fbjs you wish to connect to
const THIS_URL = 'http://localhost:3000/login'; // ... or whatever the address to your application is

const db = new sqlite3.Database(`theDatabase.db`, (err) => {
	if (err) {
		console.error(err.message);
	}
});

const server = app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

const io = require('socket.io')(server);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(session({
	secret: 'H1!l!k3$3@0fTH3!^3$',
	resave: false,
	saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
	if (req.session.user) next();
	else res.redirect('/login');
}

app.get('/', (req, res) => {
	try {
		res.render('index.ejs');
	} catch (error) {
		res.send(error.message);
	}
});

app.get('/login', (req, res) => {
	if (req.query.token) {
		let tokenData = jwt.decode(req.query.token);
		req.session.token = tokenData;
		req.session.user = tokenData.username;

		let fb_id = req.session.token.id;
		let fb_name = req.session.user;
		let query = `SELECT * FROM users WHERE fb_id = ?`;

		db.get(query, [fb_id], (err, row) => {
			if (err) {
				console.log(err);
				console.error(err);
				res.send("There was an error:\n" + err)
			} else if (row) {
				res.render("chat", { user: fb_name });
			} else {
				db.run(`INSERT INTO users(fb_name, fb_id, profile_checked) VALUES(?, ?, ?)`, [fb_name, fb_id, 0], (err) => {
					if (err) {
						console.log(err);
						console.error(err);
						res.send("There was an error:\n" + err)
					} else {
						res.render("chat", { user: fb_name });
					}
				});
			}
		});
	} else {
		res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
	}
});

app.get("/chat", isAuthenticated, (req, res) => {
	let fb_name = req.session.user;
	if (req.session.token && req.session.token.id) {
		let fb_id = req.session.token.id;

		db.get("SELECT * FROM users WHERE fb_id = ?", [fb_id], (err, user) => {
			if (err) {
				console.error(err);
				res.send("There was an error:\n" + err)
			} else {
				res.render("chat", { user: fb_name });
			}
		});
	} else {
		res.redirect('/login');
	}
});

io.on("connection", (socket) => {
	socket.join("general");
});