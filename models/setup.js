const mongoose = require("mongoose");

// const { mongouser, mongopass } = process.env;
const connectionString = "mongodb+srv://t3d:iust666cee@cluster0.iaxun.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const localConnectionString = "mongodb://localhost:27017/t3d";

exports.connectToDB = () => {
    /*mongoose.connection.collections['notices'].drop(function (err) {
        console.log('notices dropped');
    });
    mongoose.connection.collections['games'].drop(function (err) {
        console.log('games dropped');
    });
    mongoose.connection.collections['chats'].drop(function (err) {
        console.log('games dropped');
    });
    mongoose.connection.collections['users'].drop(function (err) {
        console.log('users dropped');
    });*/
    return mongoose.connect(connectionString);
};

// exports.connectToDB = () => {
//     return mongoose.connect(`mongodb://${mongouser}:${mongopass}@localhost:27017/name`, {
//         useNewUrlParser: true,
//         useCreateIndex: true
//     });
// };
