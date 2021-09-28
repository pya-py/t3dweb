const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
var onlineClients = []; //keys: clientID, values: game type and socket
// onlineClients['clientID'] = {gameType: int, room: string}
// .state determines which action user is doing: chat, play=> gameType or ...
// .state is NOT NULL and .room is null ==> player is online
// .state and .room both NOT NULL => player is in game
// .oponentID this is for when client goes out of the room and when comes back to the game
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
        var myID = null;
        socket.on("message", (data) => {
            try {
                const { request, clientID, msg } = JSON.parse(data);

                switch (request) {
                    case "online": {
                        if (!onlineClients[clientID]) {
                            // add user to online list
                            myID = clientID;
                            onlineClients[clientID] = {
                                room: null,
                                state: null,
                                socket,
                                opponentID: null,
                            };
                        } else {
                            myID = clientID; //update myID to make sure its always correct
                            // reallly its not needed khodayi!!
                            onlineClients[clientID].socket = socket; //always set the save the most recent client connection
                        }

                        socket.send(
                            createSocketCommand(
                                "ONLINE",
                                Object.keys(onlineClients).length
                            )
                        );
                        break;
                    }
                    case "find": {
                        console.log("param: ", msg);
                        const gameType = Number(msg);
                        onlineClients[clientID].state = gameType;

                        // first search in on going games: maybe user was playing game and went out for some reason
                        let readyClients = [];
                        //busyClients = [];

                        Object.keys(onlineClients).forEach((cid) => {
                            // seperates ready and busy players
                            if (cid !== clientID) {
                                //cid is not me
                                if (!onlineClients[cid].room) {
                                    //cid has no game
                                    if (onlineClients[cid].state === gameType)
                                        readyClients.push(cid);
                                } else {
                                    // busyClients.push(cid); //no needed
                                    if (onlineClients[cid].opponentID === clientID){
                                        //if this cid client's opponent was me => then my game is still running
                                        onlineClients[clientID].room = onlineClients[cid].room; //in next lines, server checks if the user has .room by default or not
                                        onlineClients[clientID].opponentID = cid; //sets opponent in my list
                                    }
                                }
                            }
                        });

                        //find opponent
                        if (onlineClients[clientID].room) {
                            //previous game remains
                            //i think this doesnt work well because of .onclose
                            socket.send(
                                createSocketCommand("ENTER_ROOM", {
                                    name: onlineClients[clientID].room,
                                    type: gameType,
                                })
                            );
                        }
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
                                [clientID, opponentID].forEach((cid) => {
                                    onlineClients[cid].socket.send(
                                        createSocketCommand("ENTER_ROOM", {
                                            name: room,
                                            type: gameType,
                                        })
                                    );
                                    onlineClients[cid].room = room;
                                });
                                onlineClients[clientID].opponentID = opponentID;
                            }
                            // send a cmd to me and opponent with roomName => after both clients set their roomName equally they auto connect
                        } else {
                            socket.send(
                                createSocketCommand("ENTER_ROOM", null)
                            );
                        }
                        // ... find a random id to connect
                        // ... generate uuid for room name
                        break;
                    }
                    default: {
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
            myID = null;
            //... complete this
        });
    });
    return globalWebSocketServer;
};
