const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
var onlineClients = []; //keys: clientID, values: game type and socket
// onlineClients['clientID'] = {gameType: int, room: string}
// .gameType is NOT NULL and .room is null ==> player is online
// .gameType and .room both NOT NULL => player is in game
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
                const { request, clientID } = JSON.parse(data);

                switch (request) {
                    case "online": {
                        if (!onlineClients[clientID]) {
                            // add user to online list
                            myID = clientID;
                            onlineClients[clientID] = {
                                room: null,
                                gameType: null,
                                socket
                            };
                        }
                        else {
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
                        const { gameType } = data;
                        onlineClients[clientID].gameType = gameType;
                        //find opponent
                        let readyClients = Object.keys(onlineClients).filter(
                            (cid) =>
                                cid !== playerID &&
                                !onlineClients[cid].room &&
                                onlineClients[cid].gameType === gameType
                        );
                        
                        if (readyClients.length >= 1) {
                            const opponentID = findRandomIndex(readyClients.length);
                            const room = uuidv4();
                            [clientID, opponentID].forEach(cid => {
                                onlineClients[cid].send(createSocketCommand("ENTER_ROOM", room));
                            })
                            // send a cmd to me and opponent with roomName => after both clients set their roomName equally they auto connect

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

                console.table(onlineClients);
            } catch (err) {
                console.log(err);
            }
        });
        socket.on("close", (data) => {
            delete onlineClients[myID];
            myID = null;
            //... complete this
        });
    });
    return globalWebSocketServer;
};
