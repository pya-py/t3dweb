const path = require("path");
const express = require("express");
const { setHeaders } = require("./middlewares/headers");
const { errorHandler } = require("./middlewares/errors");
const { connectToDB } = require("./models/setup");
const userRoutes = require("./routes/user");
const logRequests = require('./middlewares/logRequests');

const app = express();
//──── Server Port
const port = process.env.PORT || 4000;

//──── Static Folder
app.use("/images", express.static(path.join(__dirname, "public", "images")));

//──── Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(logRequests);
app.use(setHeaders);

//──── Routes
app.use('/users', userRoutes);

//──── Connecting To Database
connectToDB()
    .then(result => {
        console.log(`Connected To Database`);
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(err => {
        console.log(err);
    });

//──── Error Handler Middleware
app.use(errorHandler);