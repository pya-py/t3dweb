const WebSocket = require("ws");
const { makeFriends } = require('../../controllers/users');
const { nanoid } = require("nanoid");
const { saveMessage } = require('../../controllers/chats');
var onlines = []; //keys: clientID, values: game type and socket
// onlines['clientID'] = {gameType: int, room: string}
// .type is NOT NULL and .room is null ==> player is online
// .type and .room both NOT NULL => player is in game
// .oponentID this is for when client goes out of the room and when comes back to the game

var t3dRooms = []; //for uuid generate, nanoid is used to make ids with less memory consumption
//this will prevent enterference in gameplay
const sizeof = require('object-sizeof');
const { verifyTokenForWS } = require("../../middlewares/tokenManager");

const createSocketCommand = (command, msg) =>
    JSON.stringify({
        command,
        msg,
    });

function findRandomIndex(max) {
    if (max === 1) return 0;
    return Math.floor(Math.random() * max);
}

//temp method
const log_memory_usage = () => {
    console.log('---------------------------global-scoket-mem-----------------------------\n');
    const online_size = Number(sizeof(Object.keys(onlines)) + sizeof(Object.values(onlines))) / 1000,
        t3d_size = Number(sizeof(Object.keys(t3dRooms)) + sizeof(Object.values(t3dRooms))) / 1000;
    console.log('new user came online --> allocated memory:' + online_size + 'KB');
    console.log('new game:t3d added to games room --> allocated memory:' + t3d_size + 'KB');
    console.log('total: ' + Number(online_size + t3d_size) + 'KB');
    console.log('---------------------------global-scoket-mem-----------------------------\n');
}

const findEngagedGame = (clientID) => {
    Object.keys(t3dRooms).forEach((rid) => {
        if (t3dRooms[rid][0] === clientID || t3dRooms[rid][1] === clientID) {
            onlines[clientID].room = rid;
            return;
        }
    });
}

module.exports.closeThisRoom = expiredRoom => { //when wsGameplay ends a game or collects garbage it syncs its update with this method
    if (t3dRooms[expiredRoom]) delete t3dRooms[expiredRoom];
}

module.exports.Server = (path) => {
    let globalWebSocketServer = new WebSocket.Server({ noServer: true, path });

    //custom method
    globalWebSocketServer.collectGarbage = () => {
        // will be called by -> mainClock
        // removes trashes: clients that went offline by weren't removed by m,istake, games that are ended but still remain on the server, unwanted stuff, etc

    }

    globalWebSocketServer.on("connection", (socket) => {
        var myID = null;
        socket.on("message", (data) => {
            try {
                const { request, msg, token } = JSON.parse(data);
                const clientID = verifyTokenForWS(token); // if anything about token was wrong -> request doesnt process
                myID = clientID;
                if (clientID) {
                    switch (request) {
                        case "online":
                            {
                                console.log('online request from ' + clientID);
                                if (!onlines[clientID]) {
                                    // add user to online list

                                    onlines[clientID] = {
                                        room: null,
                                        type: null,
                                        socket,
                                    };
                                    log_memory_usage();
                                } else {
                                    myID = clientID; //update myID to make sure its always correct
                                    // really its not needed khodayi!!
                                    onlines[clientID].socket = socket; //always set the save the most recent client connection
                                }

                                socket.send(
                                    createSocketCommand("ONLINE", {
                                        players: Object.keys(onlines).length,
                                        games: Object.keys(t3dRooms).length,
                                    })
                                );
                                break;
                            }
                        case "is_online":
                            {

                                break;
                            }
                        case "find":
                            { //*******************if clientID isnt in the onlines -> error */
                                if (!onlines[clientID]) {
                                    //error !! how?
                                    //COMPLETE THIS
                                    return;
                                }
                                const gameType = Number(msg);
                                onlines[clientID].type = gameType;

                                // first search in on going games: maybe user was playing game and went out for some reason
                                findEngagedGame(clientID); //edit this method
                                //find opponent
                                if (onlines[clientID].room) {
                                    //if player was already in a game
                                    //previous game remains
                                    //i think this doesnt work well because of .onclose
                                    socket.send(
                                        createSocketCommand("FIND_RESULT", {
                                            name: onlines[clientID].room,
                                            type: gameType,
                                        })
                                    );
                                } else {
                                    //if player is trying to play a new game
                                    //busyClients = [];
                                    // let playingClientsNumber = 0;
                                    let readyClients = Object.keys(
                                        onlines
                                    ).filter(
                                        (cid) =>
                                        !onlines[cid].room && //clients who has no room
                                        onlines[cid].type === gameType && //has the same game type
                                        cid !== clientID // and its not me
                                    );

                                    // search in users with no game to find one

                                    if (readyClients.length >= 1) {
                                        // console.table(readyClients);
                                        const opponentID =
                                            readyClients[
                                                findRandomIndex(readyClients.length)
                                            ];
                                        const room = nanoid();
                                        // inform both clients
                                        if (onlines[opponentID]) {
                                            t3dRooms[room] = [clientID, opponentID];
                                            t3dRooms[room].forEach((cid) => {
                                                onlines[cid].socket.send(
                                                    createSocketCommand("FIND_RESULT", {
                                                        name: room,
                                                        type: gameType,
                                                    })
                                                );
                                                onlines[cid].room = room;
                                            });
                                            log_memory_usage();
                                        }
                                        // send a cmd to me and opponent with roomName => after both clients set their roomName equally they auto connect
                                    } else {
                                        socket.send(
                                            createSocketCommand("FIND_RESULT", null)
                                        );
                                    }
                                }

                                break;
                            }
                        case "friendly_game":
                            { //request a friendlygame from a friend
                                const { askerName, targetID, gameType } = msg;
                                findEngagedGame(clientID);
                                // onlines[clientID].type check this or not?
                                if (onlines[clientID].room) { //if player isnt in a game currenly or isnt searching
                                    socket.send(createSocketCommand("YOUR_BUSY"));
                                    //i think this doesnt work well because of .onclose
                                    socket.send(
                                        createSocketCommand("FIND_RESULT", {
                                            name: onlines[clientID].room
                                                // type: gameType,
                                        })
                                    );
                                } else if (targetID !== clientID) {
                                    if (onlines[targetID]) {
                                        if (!onlines[targetID].room) {
                                            onlines[targetID].socket.send(createSocketCommand("FRIENDLY_GAME", { askerID: clientID, askerName, gameType }));
                                            console.log('friendly game request sent');

                                        } else
                                            socket.send(createSocketCommand("TARGET_BUSY"));
                                    } else {
                                        socket.send(createSocketCommand("TARGET_OFFLINE"));
                                    }
                                }
                                break;
                            }
                        case "respond_friendlygame":
                            {
                                const { answer, inviterID, gameType } = msg;
                                findEngagedGame(clientID);
                                console.log(inviterID);
                                console.log('friendly game RESPONSE');
                                if (answer) {
                                    // if (!onlines[inviterID])
                                    //     socket.send(createSocketCommand("TARGET_OFFLINE"));
                                    if (!onlines[inviterID])
                                        socket.send(createSocketCommand("TARGET_OFFLINE"))
                                    else if (!onlines[inviterID].room && !onlines[clientID].room && inviterID !== clientID) {
                                        const room = nanoid();
                                        t3dRooms[room] = [inviterID, clientID];
                                        console.log('friendly game respond to ');
                                        t3dRooms[room].forEach((cid) => {
                                            onlines[cid].socket.send(
                                                createSocketCommand("INVITATION_ACCEPTED", {
                                                    name: room,
                                                    type: gameType,
                                                })
                                            );
                                            onlines[cid].room = room;
                                            onlines[cid].type = gameType;
                                            // add some boolean to show the game is friendly and doesnt affect records
                                        });
                                        log_memory_usage();
                                    }
                                } else {
                                    //if asker is online -> sen negative to him as a Notify message
                                }
                                break;
                            }
                        case "friendship":
                            {
                                const { targetID, askerName } = msg;
                                //inform the target
                                console.log('FRIENDSHIP');
                                if (onlines[targetID])
                                    onlines[targetID].socket.send(createSocketCommand("FRIENDSHIP_REQUEST", { askerID: clientID, askerName }));
                                else
                                    socket
                                break;
                            }
                        case "respond_friendship":
                            {
                                const { answer, targetName, askerID } = msg;
                                // target responds to the request
                                // inform the asker what the answer is
                                onlines[askerID].socket.send(createSocketCommand("FRIENDSHIP_RESPONSE", { answer, targetName }));
                                if (answer) {
                                    //if acceted then save their friendship in data base
                                    makeFriends([askerID, clientID]);
                                    // createChat(askerID, clientID);
                                }
                                break;
                            }
                        case "chat":
                            {
                                const { friendID, name, text } = msg;
                                // use chatRooms to save all messages
                                if (text) { // ignore empty texts
                                    if (!saveMessage(clientID, friendID, text)) { //when sth goes wronge in saveMessage it returns false
                                        console.log('something went off while trying to save msg');

                                    }
                                    if (onlines[friendID]) //if his online send it immediatly --> o.w. friend sees new message in his chatroom while loading
                                        onlines[friendID].socket.send(createSocketCommand("CHAT", { friendID: clientID, name, text }));
                                }
                                break;
                            }
                        case "close_game":
                            {
                                // msg -> closing room
                                if (onlines[clientID] && onlines[clientID].room) { //check if client belongs to a game room
                                    if (t3dRooms[onlines[clientID].room]) { //delete the room in t3dRooms list if it still exists
                                        delete t3dRooms[onlines[clientID].room];
                                        console.log(onlines[clientID].room + " deleted.");
                                    };

                                    onlines[clientID].room = onlines[clientID].type = null;
                                }
                                break;
                            }
                        default:
                            {
                                //...whatever
                                break;
                            }
                    }
                } else throw new Error("client didnt sent an ID!");
                // console.table(onlines);
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
            //check this
            //i want this: when user gets out, and turns back to game and game is still continuing, send back previous room id
            delete onlines[myID];
            console.log(myID + " disconnected");
            myID = null;
            //if game ended, remove t3dRooms[rid]            
            //... complete this
        });
    });
    return globalWebSocketServer;
};