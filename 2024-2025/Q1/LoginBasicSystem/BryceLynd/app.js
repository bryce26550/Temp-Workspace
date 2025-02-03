const ejs = require("ejs")
const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const app = express();
const fs = require("fs");
const crypto = require("crypto");

const key = crypto.randomBytes(32);
// encrypt data
function encrypt(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "base64") + cipher.final("base64");
  return { ciphertext: encrypted, iv: iv.toString("base64") };
}
// decrypt data
function decrypt(encryptedData, key) {
    const iv = Buffer.from(encryptedData.iv, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedData.ciphertext, "base64", "utf8") + decipher.final("utf8");
    return decrypted;
}

app.set("view engine", "ejs");

app.listen(3000);

let db = new sqlite3.Database(`password.db`, (err) =>{
    if (err) {
        console.error
    }
})

app.use(express.urlencoded({ exteneded: true }))
app.use(express.text())

app.get("/", (req, res) => {
    res.render("index")
});

app.get("/home", (req, res) =>{
    let username = req.query.username;
    let email = req.query.email;
    console.log(username, email)
    res.render("home", {username: username, email: email})
});

app.get("/login", (req, res) =>{
    res.render("login")
});

app.post("/login", (req, res) => {
    try {
        let username = req.body.userName
        let password = req.body.password

        if (!username) {
            throw Error("Username incorrect, or missing")
        } else if (!password) {
            throw Error("Password incorrcet, or missing")
        } else {
            let encryptedPassword = encrypt(password, key)
            db.get(`SELECT * FROM Users WHERE username=? AND password=?`, [username, encryptedPassword], (err, row) => {
                if (err) {
                    res.render("error", {err:err})
                } else if (!row) {
                    res.render("error", {err:err})
                } else {
                    res.redirect(`home?username=${row.username}&email=${row.email}`)
                }
            })
        }
    } catch (err) {
        res.render("error", {err: err})
    }
});

app.get("/signUp", (req, res) => {
    res.render("signUp")
});

app.post("/signUp", (req, res) =>{
    try {
        let username = req.body.userName
        let password = req.body.password
        let email = req.body.email

        if (!username) {
            throw Error("Please input username")
        } else if (!password) {
            throw Error("Please input password")
        } else if (!email) {
            throw Error("Please input email")
        } else if (!email.includes("@") || !email.includes(".")) {
            throw Error('Invalid email. Make sure to include a "@" and "."')
        } else {
            let encryptedPassword = encrypt(password, key)
            db.run(`INSERT INTO Users(username, email, password) VALUES(?, ?, ?)`,[username, email, encryptedPassword] ,(err, row) => {
                if (err) {
                    res.render('error', {err: err})
                } else {
                    res.render('login')
                }
            })
        }
    } catch (err) {
        res.render('error', {err: err})
    }
});