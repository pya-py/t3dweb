const WebSocket = require("ws");
const T3DLogic = require("./t3dLogic");
const { createGame, saveGame } = require("../../controllers/games");
const { GameRules } = require('../../configs');

var rooms = [];
const createSocketCommand = (command, msg) =>
    JSON.stringify({ command, msg });

const leaveRoom = (rname, playerID) => {
    //this methgod is for manual leave, for when players decide to leave the game
    //first one to leave must be set loser
    if (rooms[rname].playerX.id === playerID)
        rooms[rname].playerX = { id: null, socket: null, score: 0 };
    //log out playerX
    else if (rooms[rname].playerO.id === playerID)
        rooms[rname].playerO = { id: null, socket: null, score: 0 }; //log out playerO

    if (!rooms[rname].playerX.id && !rooms[rname].playerO.id)
    //if both players requested leaving: remove the room
        delete rooms[rname];
};

const updateClientConnection = (currentRoom, client, newSocket, clientsTurn) => {
    client.socket = newSocket;
    //always make sure yourTurn is set correctly
    client.socket.send(createSocketCommand("SET_TURN", clientsTurn)); //does it need to send every time?
    const { dimension, playerX, playerO } = currentRoom;
    const startCommand = createSocketCommand("START", {
        gameType: dimension,
        IDs: [playerX.id, playerO.id],
    });

    [playerX, playerO].forEach(each => {
        if (each.id) //first check each one is online then send
            each.socket.send(startCommand);
    });
};

const sendNextMoveTo = async(rname, target, nextMove, nextTurn) => {
    const { table, dimension, playerX, playerO } = rooms[rname];
    const cell = ({ floor, row, column } = T3DLogic.getCellCoordinates(nextMove, dimension));

    try {
        //if cell is empty
        if (!table[floor][row][column]) {
            rooms[rname].emptyCells--;

            //update table and scores
            table[floor][row][column] = rooms[rname].turn;
            clearTimeout(rooms[rname].turnTimeoutID); // as the move made in time, prevent timeout from happening
            T3DLogic.inspectAreaAroundTheCell(rooms[rname], cell);
            //what happens if try crashes some where near here??? 
            rooms[rname].turn = nextTurn; //update turn in game object
            //send scores and updated table back to targets
            // ...
            rooms[rname].lastMove = {
                nextMove,
                // cell,
                // table, //send les data each time to improve game speed a little(mili secs)
                xScore: playerX.score,
                oScore: playerO.score,
                turn: nextTurn //updated turn will be send to target to prevent any wronge occasions
            };

            target.socket.send(
                createSocketCommand("UPDATE", rooms[rname].lastMove)
            );

            if (!rooms[rname].gameID) {
                const { gameID } = await createGame(playerX.id, playerO.id, dimension);
                rooms[rname].gameID = gameID;
            }
        } else //cell's not empty
            throw new Error('wronge_move: selected table cell is not empty')
    } catch (err) {
        //complete this
        //suppose some one sening a move but in the middle of try some error happens
        console.log(err);
    }

};

const startTimeoutForCurrentTurn = (rname) => {
    rooms[rname].timeMoveRecieved = Date.now(); //last move time in ms
    rooms[rname].turnTimeoutID = setTimeout(() => {
        //after a special amount of time, that the player doesnt make any move, the turn will be passed from him/her to opponent
        const { playerX, playerO, turn } = rooms[rname];
        rooms[rname].turn = (turn + 1) % 2;
        [playerX, playerO].forEach(each => {
            each.socket.send(
                createSocketCommand("MOVE_MISSED", rooms[rname].turn)
            )
        });

    }, GameRules.T3D.TurnTimeOut);
}
module.exports.setupGamePlayWS = (path) => {
    let gamePlayWebSocketServer = new WebSocket.Server({ noServer: true, path });

    gamePlayWebSocketServer.on("connection", (socket) => {
        socket.on("message", (data) => {
            try {
                //rname --> roomname
                const { request, rname, playerID, msg } = JSON.parse(data);
                console.log("req:", request, ",  room:", rname, ",  pid:", playerID, ",  msg:", msg);

                if (rooms[rname] && rooms[rname].emptyCells === 0) {
                    rooms[rname].emptyCells = -1; //means that ending precedure has started already to prevent it from running multiple times
                    // ...
                    //end game
                    const endCommand = createSocketCommand("END"); //replace msg param with winner's turn
                    [rooms[rname].playerX, rooms[rname].playerO].forEach(each => {
                            each.socket.send(endCommand);
                        })
                        //determine who is the winner
                    T3DLogic.evaluateAndEndGame(rooms[rname]);
                    // ... now delete the room
                    // temp:***********temp
                    setTimeout(() => {
                        clearTimeout(rooms[rname].turnTimeoutID);

                        delete rooms[rname];
                    }, 5000);
                    /*******temp */
                    return;
                }
                // if game's not ended yet:
                if (request === "join") {
                    try {
                        // console.log(rname);
                        // if there is no room with this name, then create one
                        if (!rooms[rname]) {
                            gameType = Number(msg); //*****change this make client send the type of game */
                            rooms[rname] = T3DLogic.initiate(gameType);
                        }

                        //initiatilize room and players
                        if (!rooms[rname].playerX.id && playerID !== rooms[rname].playerO.id) {
                            rooms[rname].playerX = { id: playerID, socket, score: 0 };
                        } else if (!rooms[rname].playerO.id && playerID !== rooms[rname].playerX.id) {
                            rooms[rname].playerO = { id: playerID, socket, score: 0 };
                        }

                        const { playerX, playerO, lastMove } = rooms[rname];
                        // update connections
                        [playerX, playerO].forEach((each, index) => {
                            if (each.id === playerID) {
                                updateClientConnection(rooms[rname], each, socket, index);
                                return;
                            }
                        })

                        //else {
                        // this a third client in the room!
                        // u can set this client in a watcher array if you want to implement live watch
                        //}

                        //resend the move to make sure moves are recieved on disconnect/connecting
                        if (lastMove) {
                            socket.send(
                                createSocketCommand("UPDATE", lastMove));
                        }
                    } catch (err) {
                        console.log(err);
                    }
                } else if (request === "load") {
                    console.log(`${playerID} requested loading`);
                    const { table, playerX, playerO, turn } = rooms[rname];

                    socket.send(
                        createSocketCommand("LOAD", {
                            table,
                            turn,
                            xScore: playerX.score,
                            Score: playerO.score,

                        })
                    );
                } else if (request === "mytimer") {
                    const { timeMoveRecieved, turn, playerX, playerO, turnTimeoutID } = rooms[rname];

                    if (!playerO.id) return; //wait untill both players online
                    if (timeMoveRecieved === -1 || !turnTimeoutID) {
                        startTimeoutForCurrentTurn(rname);
                        playerX.socket.send(createSocketCommand("TIMER", GameRules.T3D.TurnTimeOut / 1000));
                    } else {

                        const remaining = Math.floor((GameRules.T3D.TurnTimeOut - (Date.now() - timeMoveRecieved)) / 1000);
                        // if (turn === msg) // msg --> client.myTurn : if its clients turn then send it the remaining time
                        //     socket.send(createSocketCommand("TIMER", remaining));
                        // -1 --> not started or not clients turn
                        [playerX, playerO].forEach((target, index) => { //just send it if the one who has the turn requested
                            if (index === turn && target.id === playerID) {
                                target.socket.send(createSocketCommand("TIMER", remaining)); //convert remaining time to seconds
                                return;
                            }
                        });
                    }

                } else if (request === "move") {
                    try {
                        const { playerX, playerO, turn } = rooms[rname];
                        if ((turn === 0 && playerID !== playerX.id) || (turn === 1 && playerID !== playerO.id))
                            throw new Error(`wronge_move: not player:${playerID} 's turn!!'`);

                        const nextTurn = (turn + 1) % 2;
                        [playerX, playerO].forEach((target, index) => {
                            if (playerID !== target.id) {
                                console.log(`sending move --> P${index+1} :${target.id} ...`);
                                sendNextMoveTo(rname, target, msg, nextTurn);
                                return; //this is for two person in the room; if you want to implement watcher thing => remove this line and update the array
                                // or determine a 
                            }
                        });

                        //update senders score and so
                        //before this i used requesting load again
                        //but i think its not needed, and considering large bytes that .table has, its not so wise to request load every time
                        //i used rooms[rname] again to directly access very recent values
                        socket.send(createSocketCommand("SCORES", {
                            turn: rooms[rname].turn,
                            xScore: rooms[rname].playerX.score,
                            oScore: rooms[rname].playerO.score
                        }));

                    } catch (err) {
                        console.log(err);
                    }
                } else if (request === "move_recieved") {
                    //for caution only: after client declares recieving its timeout starts
                    // here: msg === recieved status
                    if (msg) {
                        rooms[rname].lastMove = null;
                        startTimeoutForCurrentTurn(rname);
                    }
                } else if (request === "leave") {
                    leaveRoom(rname);
                    console.log(`${playerID} left`); //comment this
                }
            } catch (err) {
                console.log(err);
            }
        });
        socket.on("close", (data) => {
            // const { request, rname, playerID, msg } = JSON.parse(data);
            // leaveRoom(rname);
            // console.log(`${playerID} left`);
        });
    });
    return gamePlayWebSocketServer;
};