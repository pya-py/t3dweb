const UserModel = require('../../models/users');
const getChatID = require('./getChatID');

module.exports = async(req, res, next) => {
    const myID = req.CurrentUser.id;
    try {
        const me = await UserModel.findById(myID).populate("friends.self").populate("friends.chat");
        if (!me) {
            const error = new Error('No user with this id has been found');
            error.statusCode = 404;
            throw error;
        }

        const interactions = me.friends.map(friend => {
                const { self, chat } = friend;
                const { messages } = chat;
                const friendID = self._id.toString();
                const [chatID, ownerOf] = getChatID(myID, friendID);
                /*if(chatID !== chat.chatID) {
                    // ... check chatID: the id created manually by both users ids
                    // ... if it does not match it means -> error happened somewhere or even data compromised
                }*/

                //messages werent format here, because that means another .map withen a .map and for large amount of users i think its not good
                //I devided process within two part, one is formatting friend (its necessary because the version we have here contains credentials)
                // second part of the process is achieved in client side
                // server just sends an index named 'ownerOf' to determine wich message belongs to him/her
                return {
                    friend: { name: self.fullname, ID: friendID, records: self.records },
                    messages,
                    ownerOf
                }
            })
            // needed to check if is a user ? token verified means he is
            //filter las (for e.xe.) 300 messages in each chat
            // const chats = (await ChatModel.find({})).forEach(chat => {
            //     const [first, second] = chat.chatID.split(idsep); // both (first and second) contributers in chat, seperated to make sure operation doesnt go out of hand
            //     if (myID.toString() === first.toString())
            //         myChats.push({ ownerOf: 0, friendID: second, messages: chat.messages });

        //     else if (myID === second)
        //         myChats.push({ ownerOf: 1, friendID: first, messages: chat.messages })
        //         // if myID doesnt equal to any -> there's no interaction between -> they are not friends

        // });
        res.status(200).json({ interactions });
    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};