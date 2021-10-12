const WebSocket = require("ws");
const T3DLogic = require("./t3dLogic");
const { createGame, saveGame } = require("../../controllers/games");
const { GameRules } = require('../../configs');
const { verifyTokenForWS } = require("../../middlewares/tokenManager");
const sizeof = require('object-sizeof');
const { closeThisRoom } = require("../global/wsGlobal");

var rooms = [];
const createSocketCommand = (cmd, msg) =>
    JSON.stringify({ cmd, msg });

const updateClientConnection = (currentRoom, client, newSocket, myTurn) => {
    client.socket = newSocket;
    //always make sure myTurn is set correctly
    const { dimension, playerX, playerO } = currentRoom;
    const startCommand = (myTurn) => createSocketCommand("GAME", {
        myTurn,
        dimension,
        IDs: [playerX.id, playerO.id],
    });

    [playerX, playerO].forEach((each, index) => {
        if (each.id) {
            each.socket.send(startCommand(index));
        }
    });
};

const sendNextMoveTo = async(rname, target, nextMove, nextTurn) => {
    const { table, dimension, playerX, playerO, turn } = rooms[rname];
    const cell = ({ floor, row, column } = T3DLogic.getCellCoordinates(nextMove, dimension));
    console.log("SENDMOVE CALLED");
    try {
        //if cell is empty
        if (!table[floor][row][column]) {
            rooms[rname].emptyCells--;

            //update table and scores
            table[floor][row][column] = turn;
            rooms[rname].timer.timeouts[turn] = 0; //reset timeouts: suppose player has missed two moves and now made his moves -> 4 timeouts must be frequent to cause losing
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

            nextDeadline(rname);

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

const endThisGame = (rname) => {
    rooms[rname].emptyCells = -1; //means that ending precedure has started already to prevent it from running multiple times
    // ...
    //end game
    const { turn, playerX, playerO, timer, gameID } = rooms[rname];
    // check if game record has been created --> if not: this means no move has been made at all --> both players are offline from the beginning
    let lastCommand = null;
    if (gameID) {
        lastCommand = createSocketCommand("END", {
            turn: turn,
            xScore: playerX.score,
            oScore: playerO.score
        }); //replace msg param with winner's turn

        //determine who is the winner
        T3DLogic.evaluateAndEndGame(rooms[rname]);
        // ... now delete the room
        // temp:***********temp
    } else {
        // if no game record created --> consider the game never started --> summary: SHOTOR DIDI NADIDI
        lastCommand = createSocketCommand("CLOSE");
    }

    [playerX, playerO].forEach(each => {
        each.socket.send(lastCommand);
    });
    clearTimeout(timer.id);
    setTimeout(() => {
        delete rooms[rname];
        closeThisRoom(rname); //inform wsglobal to sync
    }, 5000);
}

const startGame = (rname) => {
    const { playerX, playerO, timer, dimension } = rooms[rname];
    rooms[rname].forceCloseTime = Date.now() + dimension * dimension * dimension * (GameRules.T3D.TurnTimeOut + 5) * 1000; //game force ending time in milisecs
    console.log(rooms[rname].forceCloseTime);
    // + 5 is for considering all time errors 
    [playerX, playerO].forEach(each => {
        each.socket.send(createSocketCommand("START", timer.t0));
    })
}
const nextDeadline = (rname) => {
    // this runs just at the start of the game
    rooms[rname].timer.t0 = Date.now(); //last move time in ms
    if (rooms[rname].timer.id)
        clearTimeout(rooms[rname].timer.id); // as the move made in time, prevent timeout from happening
    rooms[rname].timer.id = setTimeout(() => {
        //after a special amount of time, that the player doesnt make any move, the turn will be passed from him/her to opponent
        const { playerX, playerO, turn, timer } = rooms[rname];
        timer.timeouts[turn]++; //increment the number of repeated time outs fro this player
        if (timer.timeouts[turn] < GameRules.T3D.AllowedFrequestMissedMoves) {
            rooms[rname].turn = (turn + 1) % 2; //pass the turn to other player

            [playerX, playerO].forEach(each => {
                each.socket.send(
                    createSocketCommand("MOVE_MISSED", rooms[rname].turn)
                )
            });

            // after informing users of turn passing, next deadline starts
            nextDeadline(rname);
        } else { //player has not been responding for last 4 turns of his: he may left the game or whatever
            //anyway he/she deserves to lose 3-0
            // t0 -> its now the end time
            console.log('4 TURNS MISSED FOR PLAYER ' + turn);
            [playerX, playerO].forEach((each, index) => {
                if (index === turn) each.score = 0; //loser: the one who is not responding
                else each.score = 3;
            });
            endThisGame(rname);
        }

    }, GameRules.T3D.TurnTimeOut);
}

const leaveRoom = (rname, playerID) => { //not used yet.. cause the data here in this socket is vital and removing it has a risk of losing the game

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


//temp method
const log_memory_usage = () => {
    console.log('---------------------------gameplay-scoket-mem-----------------------------\n');
    const online_size = Number(sizeof(Object.keys(rooms)) + sizeof(Object.values(rooms))) / 1000;
    console.log('new game up and running --> allocated memory:' + online_size + 'KB');
    console.log('---------------------------gameplay-scoket-mem-----------------------------\n');
}

module.exports.Server = (path) => {
    let gamePlayWebSocketServer = new WebSocket.Server({ noServer: true, path });
    //custom method
    gamePlayWebSocketServer.collectGarbage = () => {
        console.log('gameplay garbage called in ' + Date.now());
        // will be called by -> mainClock
        // removes trashes: games that are ended but still remain on the server, unwanted stuff, etc
        Object.keys(rooms).forEach(game => {
            if (rooms[game].forceCloseTime <= Date.now()) { //means current time has passed the forceclosetime
                // delete game
                endThisGame(game);

                delete rooms[game];
                closeThisRoom(rname); //inform wsglobal to sync
                //... inform players
                //... save results or cancel the game
                console.log(`*ATTENTION: Game ${game} forcey closed.`);
            }
        })
    }

    gamePlayWebSocketServer.on("connection", (socket) => {
        socket.on("message", (data) => {
            try {
                //rname --> roomname
                const { request, rname, token, msg } = JSON.parse(data);
                const playerID = verifyTokenForWS(token); // if anything about token was wrong -> request doesnt process

                console.log("req:", request, ",  room:", rname, ",  pid:", playerID, ",  msg:", msg);

                if (rooms[rname] && rooms[rname].emptyCells === 0) {
                    endThisGame(rname);
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
                            //temp
                            log_memory_usage();
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
                            oScore: playerO.score,

                        })
                    );
                } else if (request === "mytimer") {
                    const { turn, playerX, playerO, timer, forceCloseTime } = rooms[rname];

                    if (!playerO.id) return; //wait untill both players online
                    if (timer.t0 === -1 || !timer.id) {
                        nextDeadline(rname);
                        playerX.socket.send(createSocketCommand("TIMER", GameRules.T3D.TurnTimeOut / 1000));
                    } else {
                        const remaining = Math.floor((GameRules.T3D.TurnTimeOut - (Date.now() - timer.t0)) / 1000);
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
                    //forceCloseTime is set according to game start time, so if not set -> game not started yet
                    if (forceCloseTime === -1) startGame(rname); //this time is used for garbage collection, to detect a game that is on the server for a long time and hasnt been deleted

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
                    }
                } else if (request === "leave") {
                    leaveRoom(rname);
                    console.log(`${playerID} left`); //comment this
                }
            } catch (err) {
                console.log(err);
                // wonge token: token expired | token compromised | token generated by sb else | token been stolen
                //if token is decoded but is wronge somehow ==> BLOCK CLIENT?
                if (err.statusCode) {
                    socket.send(createSocketCommand("NOT_AUTHORIZED", err.statusCode)); // force client to sign in page in client
                    delete onlines[clientID];
                } // set player state to offline}
                switch (err.statusCode) {
                    case 465:
                        // .. wrong token
                        break;
                    case 466:
                        // ... token compromised or edited
                        break;
                    case 467:
                        //... not token's owner ! thief
                        break;
                    default:
                        // ...bad request
                        break;
                }
            }
        });
        socket.on("close", (data) => {
            //create a new request informing other player that his opponent disconnected

        });
    });
    return gamePlayWebSocketServer;
};