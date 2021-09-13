const WebSocket = require("ws");

const LAST_MOVE_KEY = "LAST_MOVE";
const PLAYERS_KEY = "PLAYERS";

var wss = undefined,
    rooms = [],
    lastMove = null;
const createSocketCommand = (command, msg) =>
    JSON.stringify({
        command,
        msg,
    });

const leaveRoom = (roomName, playerID) => {
    if (!rooms[roomName][PLAYERS_KEY][playerID]) return; //this playerID doesnt exist  in the room; ignore it
    // if this player is the only one in the room
    if (Object.keys(rooms[roomName][PLAYERS_KEY]).length <= 1)
        // delete the room entirely
        delete rooms[roomName];
    // if there are at least two in the room
    else delete rooms[roomName][PLAYERS_KEY][playerID]; // just remove this player
};

const forceSendLastMove = (roomName, targetID) => {
    try {
        if (rooms[roomName][LAST_MOVE_KEY]) {
            console.log("last-move: ", rooms[roomName][LAST_MOVE_KEY]);
            console.table(rooms[roomName]);
            if (rooms[roomName][PLAYERS_KEY][targetID].socket) {
                rooms[roomName][PLAYERS_KEY][targetID].socket.send(
                    createSocketCommand("MOVE", rooms[roomName][LAST_MOVE_KEY])
                );
            }
            setTimeout(() => {
                forceSendLastMove(roomName, targetID);
            }, 1000);
        }
    } catch (err) {
        console.log(err);
    }
};
module.exports.setupWS = (server) => {
    wss = new WebSocket.Server({ server });
    wss.on("connection", (socket) => {
        socket.on("message", (data) => {
            const { request, roomName, playerID, msg } = JSON.parse(data);
            console.log("req:", request, "room:", roomName);
            if (request === "join") {
                // console.log(roomName);
                // if there is no room with this name, then create one
                if (!rooms[roomName]) {
                    rooms[roomName] = [];
                    rooms[roomName][PLAYERS_KEY] = [];
                }
                //if the room exists(or already created),and the player is not, just add playerID in the room
                //for each entry in each room, there is a key(playerID) and value(currect socket connection)
                const turn = Object.keys(rooms[roomName][PLAYERS_KEY]).length; //this turn is used for new players,
                // old players in the room, have thir previous turn
                if (!rooms[roomName][PLAYERS_KEY][playerID])
                    rooms[roomName][PLAYERS_KEY][playerID] = { socket, turn };
                else{
                    rooms[roomName][PLAYERS_KEY][playerID].socket = socket;
                }
                // ***** catch errors

                socket.send(
                    createSocketCommand(
                        "SET_TURN",
                        rooms[roomName][PLAYERS_KEY][playerID].turn
                    )
                );
                //error 1: if the player is the third one in the room ===> sorry bro
                if (Object.keys(rooms[roomName][PLAYERS_KEY]).length === 2) {
                    //means two players are connected
                    //send message to each player to tell them the game is started
                    console.log("game started");
                    Object.entries(rooms[roomName][PLAYERS_KEY]).forEach(
                        ([, playerInTheRoom]) =>
                            playerInTheRoom.socket.send(
                                createSocketCommand(
                                    "START",
                                    Object.keys(rooms[roomName][PLAYERS_KEY])
                                )
                            )
                    );
                }
                // if turn  >1 ==> set the client as watcher
                // console.log(rooms[roomName][PLAYERS_KEY][playerID]);
            } else if (request === "move") {
                try {
                    //console.table(Object.keys(rooms[roomName][PLAYERS_KEY]));
                    Object.entries(rooms[roomName][PLAYERS_KEY]).forEach(
                        ([targetID, clientInTheRoom]) => {
                            try {
                                if (playerID !== targetID) {
                                    console.log(
                                        "send move to player: ",
                                        clientInTheRoom.turn
                                    );
                                    // send move to other client(player)
                                    // here is the summuary:
                                    // untill lastMove is not null => forceSend move
                                    // when move reciever, responds to MOVE ==> ,means move is recieved ==> stop forceSend
                                    // the last mad move, will be send to client to apply
                                    // if client recieves the move
                                    rooms[roomName][LAST_MOVE_KEY] = msg;

                                    forceSendLastMove(roomName, targetID);
                                }
                            } catch (err) {
                                console.log(err);
                            }
                        }
                    );
                } catch (err) {
                    console.log(err);
                }
            } else if (request === "moveRecieved") {
                // here: msg === recieved status
                if (msg) {
                    rooms[roomName][LAST_MOVE_KEY] = null;
                }
            } else if (request === "leave") {
                //leaveRoom(roomName);
                console.log(`${playerID} left`); //comment this
            }
            // if (wss.clients.size <= 2) ws.send((wss.clients.size - 1).toString());
        });

        // socket.on("moveRecieved", (data) => {
        //     const {recieved, roomName} = JSON.parse(data);
        //     if (recieved)rooms[roomName][LAST_MOVE_KEY] = null;
        // });
        socket.on("close", (data) => {
            // what the fuck is wronge
            // const { request, roomName, playerID, msg } = JSON.parse(data);
            // leaveRoom(roomName);
            // console.log(`${playerID} left`);
        });
    });
};
