const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const socketIo = require('socket.io');
const { routes } = require('./modules/routes'); // Import the custom routes module
const { socket } = require('./modules/socket'); // Import the custom socket module
const SQLiteStore = require('connect-sqlite3')(session);
const bodyParser = require('body-parser'); // Import body-parser

const app = express();
app.set('view engine', 'ejs');
const PORT = 3000;
const server = app.listen(PORT, () => {});
const io = socketIo(server);
const sessionMiddleware = session({
    store: new SQLiteStore, 
    secret: "MySpecialSecretLittleKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } //Set to true if using HTTPS
});

app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser middleware
app.use(sessionMiddleware);
io.use((socket, next) => { sessionMiddleware(socket.request, {}, next); });

// Call the routes function and pass the app instance
routes(app);
// Call the socket function and pass the io instance
socket(io);