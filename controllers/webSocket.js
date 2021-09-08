const WebSocket = require("ws");

var wss = undefined,
    rooms = [];
const createSocketCommand = (command, msg) =>
    JSON.stringify({
        command,
        msg,
    });

const leaveRoom = (roomName, playerID) => {
    if (!rooms[roomName][playerID]) return; //this playerID doesnt exist  in the room; ignore it
    // if this player is the only one in the room
    if (Object.keys(rooms[roomName]).length <= 1)
        // delete the room entirely
        delete rooms[roomName];
    // if there are at least two in the room
    else delete rooms[roomName][playerID]; // just remove this player
};

module.exports.setupWS = (server) => {
    wss = new WebSocket.Server({ server });
    wss.on("connection", (socket) => {
        socket.on("message", (data) => {
            const { request, roomName, playerID, msg } = JSON.parse(data);

            if (request === "join") {
                // console.log(roomName);
                // if there is no room with this name, then create one
                if (!rooms[roomName]) rooms[roomName] = [];
                //if the room exists(or already created),and the player is not, just add playerID in the room
                //for each entry in each room, there is a key(playerID) and value(currect socket connection)
                const turn = Object.keys(rooms[roomName]).length; //this turn is used for new players,
                // old players in the room, have thir previous turn
                if (!rooms[roomName][playerID])
                    rooms[roomName][playerID] = { socket, turn };
                // ***** catch errors
                //error 1: if the player is the third one in the room ===> sorry bro

                socket.send(
                    createSocketCommand(
                        "SET_TURN",
                        rooms[roomName][playerID].turn
                    )
                );

                if (turn === 1) {
                    //means two players are connected
                    //send message to each player to tell them the game is started
                    Object.entries(rooms[roomName]).forEach(
                        ([, playerInTheRoom]) =>
                            playerInTheRoom.socket.send(
                                createSocketCommand("START", null)
                            )
                    );
                }
                // console.log(rooms[roomName][playerID]);
            } else if (request === "move") {
                Object.entries(rooms[roomName]).forEach(
                    ([, playerInTheRoom]) => {
                        if (socket !== playerInTheRoom.socket) {
                            // send move to other client(player)
                            playerInTheRoom.socket.send(
                                createSocketCommand("MOVE", msg )
                            );
                        }
                    }
                );
            } else if (request === "leave") {
                leaveRoom(roomName);
                console.log(`${playerID} left`); //comment this
            }
            // if (wss.clients.size <= 2) ws.send((wss.clients.size - 1).toString());
        });
        socket.on("close", (data) => {
            // what the fuck is wronge
            // const { request, roomName, playerID, msg } = JSON.parse(data);
            // leaveRoom(roomName);
            // console.log(`${playerID} left`);
        });
    });
};
