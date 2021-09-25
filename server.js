const path = require("path");
const express = require("express");
const { setHeaders } = require("./middlewares/setHeaders");
const { errorHandler } = require("./middlewares/errorHandler");
const { connectToDB } = require("./models/setup");
const usersRoutes = require("./routes/users");
const gamesRoutes = require("./routes/games");
const noticesRoutes = require('./routes/notices');
const { setupWS } = require("./controllers/gameplay/webSocket");
const { createServer } = require("http");
const {morganLogger} = require('./middlewares/morganLogger');

const app = express();
//──── Server Port
const PORT = process.env.PORT || 4000;

//──── Static Folder
app.use("/images", express.static(path.join(__dirname, "public", "images")));

//──── Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(setHeaders);
app.use(morganLogger);

//──── Routes
app.use("/users", usersRoutes);
app.use("/games", gamesRoutes);
app.use("/notices", noticesRoutes);

//---- WebSocket
const server = createServer(app);
setupWS(server);

//error handler: must be put after all middlewares
app.use(errorHandler);

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
