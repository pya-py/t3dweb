const WebSocket = require("ws");
const GameLogic = require('./gameLogic');

var wss = undefined,
    rooms = [];
const createSocketCommand = (command, msg) =>
    JSON.stringify({
        command,
        msg,
    });

const updateClientConnection = (roomName, client, newSocket, clientsTurn) => {
    client.socket = newSocket;
    //always make sure yourTurn is set correctly
    client.socket.send(createSocketCommand("SET_TURN", clientsTurn));
    console.log("****yourTurn: ", clientsTurn);
    const startCommand = createSocketCommand("START", [
        rooms[roomName].playerX.id,
        rooms[roomName].playerO.id,
    ]);

    rooms[roomName].playerX.id &&
        rooms[roomName].playerX.socket.send(startCommand);
    rooms[roomName].playerO.id &&
        rooms[roomName].playerO.socket.send(startCommand);

};

const sendNewMoveTo = (roomName, client, newMove, playerIndex) => {
    // if (rooms[roomName].lastMove !== newMove) {
    //     //now inspect
    //     //this makes sure inspectaton just runs once
    //     // actually i dont thinl its necessary
    //     // cause inpecting runs only once, when the new move cell is empty
    //     //after filling the  cell move is skipped
    // }
    const { table, dimension, playerX, playerO } = rooms[roomName];
    const cell = { floor, row, column } = GameLogic.getCellCoordinates(newMove, dimension);
    if (!table[floor][row][column]) { //if cell is empty
        rooms[roomName].emptyCells--;

        //update table and scores
        table[floor][row][column] = playerIndex;
        GameLogic.inspectAreaAroundTheCell(rooms[roomName], cell);

        //send scores and updated table back to clients
        // ...
        rooms[roomName].lastMove = { newMove, cell, table, xScore: playerX.score, oScore: playerO.score };
        console.log(rooms[roomName]);
        client.socket.send(createSocketCommand("UPDATE", rooms[roomName].lastMove));
    }
};

module.exports.setupWS = (server) => {
    wss = new WebSocket.Server({ server });
    wss.on("connection", (socket) => {
        socket.on("message", (data) => {
            try {
                const { request, roomName, playerID, msg } = JSON.parse(data);
                console.log(
                    "req:",
                    request,
                    ",  room:",
                    roomName,
                    ",  pid:",
                    playerID,
                    ",  msg:",
                    msg
                );
                if (rooms[roomName] && !rooms[roomName].emptyCells) {
                    // determine the winner
                    // ...
                    //end game
                    const endCommand = createSocketCommand(
                        "END",
                        "winner yourTurn"
                    ); //replace msg param with winner's turn
                    rooms[roomName].playerX.socket.send(endCommand);
                    return;
                }
                // if game's not ended yet:
                if (request === "join") {
                    try {
                        // console.log(roomName);
                        // if there is no room with this name, then create one
                        if (!rooms[roomName]) {
                            gameType = Number(msg); //*****change this make client send the type of game */
                            console.log(gameType);
                            rooms[roomName] = GameLogic.initiate(gameType);

                        }

                        //initiatilize room and players
                        if (!rooms[roomName].playerX.id && playerID !== rooms[roomName].playerO.id) {
                            rooms[roomName].playerX = {
                                id: playerID,
                                socket,
                                score: 0,
                                shape: 'X'
                            };
                        } else if (!rooms[roomName].playerO.id && playerID !== rooms[roomName].playerX.id) {
                            rooms[roomName].playerO = {
                                id: playerID,
                                socket,
                                score: 0,
                                shape: 'O'
                            };
                        }

                        // update connections
                        if (rooms[roomName].playerX.id === playerID) {
                            updateClientConnection(
                                roomName,
                                rooms[roomName].playerX,
                                socket,
                                0
                            );
                        }
                        //always get the latest socket connection ==> fixes connection lost problem
                        else if (rooms[roomName].playerO.id === playerID) {
                            updateClientConnection(
                                roomName,
                                rooms[roomName].playerO,
                                socket,
                                1
                            );
                        } else {
                            // this a third client in the room!
                            // u can set this client in a watcher array if you want to implement live watch
                        }

                        //alternative for forceSendLastMove
                        //resend the move to make sure moves are recieved on disconnect/connecting
                        if (rooms[roomName].lastMove) {
                            console.log(rooms[roomName]);
                            socket.send(
                                createSocketCommand(
                                    "UPDATE",
                                    rooms[roomName].lastMove
                                )
                            );
                        }
                    } catch (err) {
                        console.log(err);
                    }
                } else if (request === "load") {
                    console.log(`${playerID} requested loading`);
                    const { table, playerX, playerO, turn } = rooms[roomName];

                    socket.send(
                        createSocketCommand("LOAD", { table, xScore: playerX.score, oScore: playerO.score, turn })
                    );

                } else if (request === "move") {
                    try {
                        if (playerID === rooms[roomName].playerX.id) {
                            console.log("sending move to player O ...");
                            sendNewMoveTo(
                                roomName,
                                rooms[roomName].playerO,
                                msg,
                                0
                            );
                        } else if (playerID === rooms[roomName].playerO.id) {
                            console.log("sending move to player X ...");
                            sendNewMoveTo(
                                roomName,
                                rooms[roomName].playerX,
                                msg,
                                1
                            );
                        } else {
                            //fuckin watcher maybe
                        }
                        rooms[roomName].turn = (rooms[roomName].turn + 1) % 2;

                    } catch (err) {
                        console.log(err);
                    }
                } else if (request === "moveRecieved") {
                    // actually its not needed , but for caution only :)
                    // here: msg === recieved status
                    if (msg) {
                        rooms[roomName].lastMove = null;
                    }
                } else if (request === "leave") {
                    //leaveRoom(roomName);
                    console.log(`${playerID} left`); //comment this
                }
                // if (wss.clients.size <= 2) ws.send((wss.clients.size - 1).toString());
            } catch (err) {
                console.log(err);
            }
        });
        socket.on("close", (data) => {
            // const { request, roomName, playerID, msg } = JSON.parse(data);
            // leaveRoom(roomName);
            // console.log(`${playerID} left`);
        });
    });
};

/*const leaveRoom = (roomName, playerID) => {
    if (!rooms[roomName][PLAYERS_KEY][playerID]) return; //this playerID doesnt exist  in the room; ignore it
    // if this player is the only one in the room
    if (Object.keys(rooms[roomName][PLAYERS_KEY]).length <= 1)
        // delete the room entirely
        delete rooms[roomName];
    // if there are at least two in the room
    else delete rooms[roomName][PLAYERS_KEY][playerID]; // just remove this player
};*/
/*const forceSendLastMove = (roomName, targetID) => {
    // mobile browser bug fixed
    // set a timeout numbers limit
    // or=> just resend move on re join ( it seems sufficent and send less commands )
    // think it
    try {
        if (rooms[roomName][LAST_MOVE_KEY]) {
            console.log("last-move: ", rooms[roomName][LAST_MOVE_KEY]);
            console.table(rooms[roomName]);
            if (rooms[roomName][PLAYERS_KEY][targetID].socket) {
                rooms[roomName][PLAYERS_KEY][targetID].socket.send(
                    createSocketCommand("UPDATE", rooms[roomName][LAST_MOVE_KEY])
                );
            }
            setTimeout(() => {
                forceSendLastMove(roomName, targetID);
            }, 1000);
        }
    } catch (err) {
        console.log(err);
    }
};*/