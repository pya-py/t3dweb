const path = require("path");
const express = require("express");
const { setHeaders } = require("./middlewares/setHeaders");
const { errorHandler } = require("./middlewares/errorHandler");
const { connectToDB } = require("./models/setup");
const usersRoutes = require("./routes/users");
const gamesRoutes = require("./routes/games");
const chatsRoutes = require("./routes/chats");
const noticesRoutes = require("./routes/notices");
const { bindSocketsToMainServer } = require("./websockets");
const { createServer } = require("http");
const { morganLogger } = require("./middlewares/morganLogger");
const { Routes } = require("./configs");

const app = express();
//──── Server Port
const PORT = process.env.PORT || 4000;

//──── Static Folder
app.use(`/${Routes.Avatars}`, express.static(path.join(__dirname, "public", Routes.Avatars)));
app.use(`/log`, express.static(path.join(__dirname, "middlewares", "access.log")));

//──── Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(setHeaders);
app.use(morganLogger);

//──── Routes
app.use(`/${Routes.Users}`, usersRoutes);
app.use(`/${Routes.Games}`, gamesRoutes);
app.use(`/${Routes.Notices}`, noticesRoutes);
app.use(`/${Routes.Chats}`, chatsRoutes);
//---- WebSocket
const server = createServer(app);
bindSocketsToMainServer(server);

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