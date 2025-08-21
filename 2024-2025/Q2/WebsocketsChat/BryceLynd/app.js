const ejs = require("ejs");
const e = require("express");
const express = require("express")
const app = express();
const http = require('http').Server(app);
const { WebSocketServer } = require('ws')
const wss = new WebSocketServer({ server: http });

http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/chat", (req, res) => {
    if (req.query.name) {
        res.render("chat", {name: req.query.name});
    } else {
        res.redirect("/");
    };
});

function broadcast(wss, message) {
    for (client of wss.clients) {
        client.send(JSON.stringify(message));
    }
};

function userList(wss) {
    let usr = []
    for (client of wss.clients) {
        if (client.hasOwnProperty("name")) {
            usr.push(client.name)
        };
    };
    return { list: usr }
};

wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ name: "Server", text: "welcome to Chat!" }));
    broadcast(wss, userList(wss))

    ws.on("message", (message) => {
        message = JSON.parse(message)
        
        if (message.hasOwnProperty("text")) {
            broadcast(wss, message)
        };

        if (message.hasOwnProperty("name")) {
            ws.name = message.name
            broadcast(wss, userList(wss))
        };
    });
});

wss.on("close", () => {
    broadcast(wss, userList(wss))
});