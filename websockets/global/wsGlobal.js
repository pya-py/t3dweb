const WebSocket = require("ws");
const { makeFriends } = require('../../controllers/users');
const { v4: uuidv4 } = require("uuid");
var onlineClients = []; //keys: clientID, values: game type and socket
// onlineClients['clientID'] = {gameType: int, room: string}
// .type is NOT NULL and .room is null ==> player is online
// .type and .room both NOT NULL => player is in game
// .oponentID this is for when client goes out of the room and when comes back to the game
var gameRooms = [],
    chatrooms = []; //esp. for chtting only
//this will prevent enterference in gameplay

const createSocketCommand = (command, msg) =>
    JSON.stringify({
        command,
        msg,
    });

function findRandomIndex(max) {
    if (max === 1) return 0;
    return Math.floor(Math.random() * max);
}

module.exports.setupGlobalWS = (path) => {
    let globalWebSocketServer = new WebSocket.Server({ noServer: true, path });

    globalWebSocketServer.on("connection", (socket) => {
        let myID = null;
        socket.on("message", (data) => {
            try {
                const { request, clientID, msg } = JSON.parse(data);

                switch (request) {
                    case "online":
                        {
                            console.log('online request from ' + clientID);
                            if (!onlineClients[clientID]) {
                                // add user to online list
                                myID = clientID;
                                onlineClients[clientID] = {
                                    room: null,
                                    type: null,
                                    socket,
                                };
                            } else {
                                myID = clientID; //update myID to make sure its always correct
                                // reallly its not needed khodayi!!
                                onlineClients[clientID].socket = socket; //always set the save the most recent client connection
                            }

                            socket.send(
                                createSocketCommand("ONLINE", {
                                    players: Object.keys(onlineClients).length,
                                    games: Object.keys(gameRooms).length,
                                })
                            );
                            break;
                        }
                    case "find":
                        {
                            const gameType = Number(msg);
                            onlineClients[clientID].type = gameType;

                            // first search in on going games: maybe user was playing game and went out for some reason
                            Object.keys(gameRooms).forEach((rid) => {
                                if (
                                    gameRooms[rid][0] === clientID ||
                                    gameRooms[rid][1] === clientID
                                ) {
                                    onlineClients[clientID].room = rid;
                                    return; //does it work correctly???
                                }
                            });
                            //find opponent
                            if (onlineClients[clientID].room) {
                                //if player was already in a game
                                //previous game remains
                                //i think this doesnt work well because of .onclose
                                socket.send(
                                    createSocketCommand("ENTER_ROOM", {
                                        name: onlineClients[clientID].room,
                                        type: gameType,
                                    })
                                );
                            } else {
                                //if player is trying to play a new game
                                //busyClients = [];
                                // let playingClientsNumber = 0;
                                let readyClients = Object.keys(
                                    onlineClients
                                ).filter(
                                    (cid) =>
                                    !onlineClients[cid].room && //clients who has no room
                                    onlineClients[cid].type === gameType && //has the same game type
                                    cid !== clientID // and its not me
                                );

                                // search in users with no game to find one

                                console.table(onlineClients);

                                if (readyClients.length >= 1) {
                                    // console.table(readyClients);
                                    const opponentID =
                                        readyClients[
                                            findRandomIndex(readyClients.length)
                                        ];
                                    const room = uuidv4();
                                    // inform both clients
                                    if (onlineClients[opponentID]) {
                                        gameRooms[room] = [clientID, opponentID];
                                        gameRooms[room].forEach((cid) => {
                                            onlineClients[cid].socket.send(
                                                createSocketCommand("ENTER_ROOM", {
                                                    name: room,
                                                    type: gameType,
                                                })
                                            );
                                            onlineClients[cid].room = room;
                                        });

                                    }
                                    // send a cmd to me and opponent with roomName => after both clients set their roomName equally they auto connect
                                } else {
                                    socket.send(
                                        createSocketCommand("ENTER_ROOM", null)
                                    );
                                }
                            }
                            // ... find a random id to connect
                            // ... generate uuid for room name
                            break;
                        }
                    case "is_sb_online":
                        {

                        }
                    case "ask_friendship":
                        {
                            const { targetID, askerName } = msg;
                            //inform the target
                            onlineClients[targetID].socket.send(createSocketCommand("FRIENDSHIP_REQUEST", { askerID: clientID, askerName }));

                            break;
                        }
                    case "respond_friendship":
                        {
                            const { answer, targetName, askerID } = msg;
                            // target responds to the request
                            // inform the asker what the answer is
                            onlineClients[askerID].socket.send(createSocketCommand("FRIENDSHIP_RESPONSE", { answer, targetName }));
                            if (answer) {
                                //if acceted then save their friendship in data base
                                makeFriends([askerID, clientID]);
                            }
                            break;
                        }
                    case "chat":
                        {
                            const { friendID, name, text } = msg;
                            console.log("LOG ME", msg);
                            // use chatRooms to save all messages
                            onlineClients[friendID].socket.send(createSocketCommand("CHAT", { friendID: clientID, name, text }));
                            break;
                        }
                    case "close_game":
                        {
                            // msg -> closing room
                            if (onlineClients[clientID].room) { //check if client belongs to a game room
                                if (gameRooms[onlineClients[clientID].room]) { //delete the room in gameRooms list if it still exists
                                    delete gameRooms[onlineClients[clientID].room];
                                    console.log(onlineClients[clientID].room + " deleted.");
                                    console.table(gameRooms);
                                };

                                onlineClients[clientID].room = onlineClients[clientID].type = null;
                                console.log(onlineClients[clientID]);
                            }
                            break;
                        }
                    default:
                        {
                            //...whatever
                            break;
                        }
                }

                // console.table(onlineClients);
            } catch (err) {
                console.log(err);
            }
        });
        socket.on("close", (data) => {
            //check this
            //i want this: when user gets out, and turns back to game and game is still continuing, send back previous room id
            delete onlineClients[myID];
            console.log(myID + " disconnected");
            myID = null;
            //if game ended, remove gameRooms[rid]            
            //... complete this
        });
    });
    return globalWebSocketServer;
};