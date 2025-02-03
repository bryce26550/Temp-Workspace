const ejs = require("ejs");
const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const app = express();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const { error, profile } = require("console");
const port = 3000;
const AUTH_URL = "http://172.16.3.100:420/oauth";
const THIS_URL = "http://172.16.3.235:3000/login";

const db = new sqlite3.Database(`theDatabase.db`, (err) => {
    if (err) {
        console.error(err.message);
    }
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "H1!l!k3$3@0fTH3!^3$",
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect("/login");
}

app.get("/", (req, res) => {
    try {
        res.redirect("/login");
    } catch (error) {
        res.send(error.message);
    }
});

app.get("/login", (req, res) => {
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
        res.redirect("/login");
    }
});

io.on("connection", (socket) => {
    socket.on("user_connected", (username) => {
        socket.username = username; // Store username on socket
        socket.join("general"); // Automatically join the "general" room
        console.log(`${username} has connected and joined general`);
        updateRoomList(socket);
    });

    socket.on("join_room", (data) => {
        const { user, room } = data;
        socket.join(room);
        console.log(`${user} joined room: ${room}`);
        updateRoomList(socket);
    });

    socket.on("leave_room", (data) => {
        const { user, room } = data;
        socket.leave(room);
        console.log(`${user} left room: ${room}`);
        updateRoomList(socket);
    });

    socket.on("message", (data) => {
        console.log("Message received on server:", data);
        io.to(data.room).emit("message", data);
    });

    socket.on('get_room_users', (data) => {
        const room = data.room;
        const clients = io.sockets.adapter.rooms.get(room);
        const users = [];
        if (clients) {
            clients.forEach(clientId => {
                const clientSocket = io.sockets.sockets.get(clientId);
                if (clientSocket) {
                    users.push(clientSocket.username);
                }
            });
        }
        socket.emit('room_users', { room, users });
    });

    socket.on("user_disconnected", (username) => {
        console.log(`${username} has disconnected`);
    });

    function updateRoomList(socket) {
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        socket.emit("roomsList", rooms);
    }
});