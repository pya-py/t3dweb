const path = require("path");
const express = require("express");
const { setHeaders } = require("./middlewares/headers");
const { errorHandler } = require("./middlewares/errors");
const { connectToDB } = require("./models/setup");
const usersRoutes = require("./routes/users");
const gamesRoutes = require("./routes/games");

const { setupWS } = require("./controllers/webSocket");
const { createServer } = require("http");
const logRequests = require("./middlewares/logRequests");

const app = express();
//──── Server Port
const PORT = process.env.PORT || 4000;

//──── Static Folder
app.use("/images", express.static(path.join(__dirname, "public", "images")));

//──── Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(logRequests);
app.use(setHeaders);

//──── Routes
app.use("/users", usersRoutes);
app.use("/games", gamesRoutes);

//──── Error Handler Middleware
app.use(errorHandler);

//---- WebSocket
const server = createServer(app);
setupWS(server);

//──── Connecting To Database
connectToDB()
    .then((result) => {
        console.log(`Connected To Database`);
        server.listen(PORT, () => {
            console.log(`Server running on PORT ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });



