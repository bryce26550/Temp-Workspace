const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
var viewpoint = "online";
const app = express();
app.set('view engine', 'ejs');
app.listen(3000)

app.get('/', (req, res) => {
    res.render('index', { viewpoint: viewpoint });
});
app.get('/print', (req, res) => {
    viewpoint = "offline";
    ejs.renderFile('./views/index.ejs', { viewpoint: viewpoint },
        (err, renderedTemplate) => {
            console.log(renderedTemplate);

            fs.writeFile('index.html', renderedTemplate, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('File written successfully');

                }
            });
        });
    res.send("File successfully  printed")
});