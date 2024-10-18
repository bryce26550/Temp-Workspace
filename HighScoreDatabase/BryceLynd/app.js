let ejs = require("ejs")
const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const app = express();
const fs = require("fs");
const jsbn = require("jsbn");
const requestip = require('request-ip')

app.set("view engine", "ejs");

app.listen(3000);

let db = new sqlite3.Database(`thedatabase.db`, (err) =>{
    if (err) {
        console.error
    }
})

app.use(express.urlencoded({ exteneded: true }))
app.use(express.text())

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/game", (req, res) => {
    res.render("game");
});

app.get("/hiscore", (req, res) => {
    db.all(`SELECT * FROM users ORDER BY score DESC LIMIT 10`, (err, row) => {
        if (err) {
            console.error(err);
        } else {
            res.render("hiscore", { data: row});
        }
    })
});

app.post("/hiscore", (req, res) => {
    var something = JSON.parse(req.body)
    console.log(something)
    try {
        if (!something.Name) {
            throw new Error(`Value of ${something.Name} is null or undefined`)
        } else if (!something.Score && something.Score != 0) {
            throw new Error(`Value of ${something.Score} is null or undefined`)
        }
        var ip = requestip.getClientIp(req)
        db.run(`INSERT INTO users(ip, name, score) VALUES(?, ?, ?)`, [ip, something.Name, something.Score])
    } catch (err) {
        res.render('error', {err: err})
    }
});