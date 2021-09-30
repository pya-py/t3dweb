const mongoose = require("mongoose");
const UserModel = require("../../../models/users");

const areFriends = (person, sbFriends) =>
    Boolean(sbFriends.filter((friend) => person.toString() === friend.toString()).length); //.toString() is essential for both ids

module.exports = async(IDs) => {
    try {
        if (IDs.length !== 2) {
            const error = new Error(
                "ID array list must contain both friends id"
            ); //status code doesnt work!?
            error.statusCode = 403; //change
            throw error;
        }
        let persons = [];
        for (const eachID of IDs) {
            const eachUser = await UserModel.findById(eachID);
            if (!eachUser) {
                const error = new Error("One of the players wasnt found");
                error.statusCode = 404;
                throw error;
            }
            persons.push(eachUser);
        }

        for (let index = 0; index < IDs.length; index++) {
            const friendID = IDs[Number(!index)];
            const friendsObjectID = mongoose.Types.ObjectId(friendID);
            if (areFriends(friendID, persons[index].friends)) {
                const error = new Error("These two were friends before");
                error.statusCode = 404;
                throw error;
            }
            persons[index].friends.push(friendsObjectID);
            persons[index].save();
        }
    } catch (err) {
        console.log(err);
    }
};