const mongoose = require("mongoose");

// const { mongouser, mongopass } = process.env;
const connectionString = "mongodb+srv://t3d:iust666cee@cluster0.iaxun.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const localConnectionString = "mongodb://localhost:27017/t3d";

exports.connectToDB = () => {
    return mongoose.connect(connectionString);
};

// exports.connectToDB = () => {
//     return mongoose.connect(`mongodb://${mongouser}:${mongopass}@localhost:27017/name`, {
//         useNewUrlParser: true,
//         useCreateIndex: true
//     });
// };