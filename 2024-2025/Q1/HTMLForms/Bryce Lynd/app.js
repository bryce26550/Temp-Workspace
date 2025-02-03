let ejs = require("ejs")
const express = require("express");
const app = express();
const fs = require("fs")

app.set("view engine", "ejs");
app.listen(3000)

app.use(express.urlencoded({ exteneded: true }))
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/add", (req, res) => {
    res.render("add");
});

app.get("/views", (req, res) => {
    try {
        const dataPath = "./data.json"
        const fileContenent = fs.readFileSync(dataPath);
        const jsonData  = JSON.parse(fileContenent);
        const data = jsonData.data || [];
        res.render("views", { data: data });
    } catch (err) {
        res.render("error", { error: err.message });
    }
});

app.post("/add", (req, res) => {

    try {
        const dataPath = "./data.json"
        const fileContenent = fs.readFileSync(dataPath);
        const jsonData  = JSON.parse(fileContenent);
        const data = jsonData.data || [];
        const monsterData = {
            horn: req.body.horn,
            hornAmount: req.body.hornAmount,
            bodyType: req.body.bodyType,
            skin: req.body.skin,
            tail: req.body.tail,
            name: req.body.name,
            M_name: req.body.M_name
        }
        data.push(monsterData)
        fs.writeFileSync(dataPath, JSON.stringify({ data: data }, null, 2));
        res.redirect("/");
    } catch (err) {
        res.render("error", { error: err.message });
    }
});