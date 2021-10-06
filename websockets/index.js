const GamePlayWebSocket = require("./gameplay/wsGamePlay");
const GlobalWebSocket = require("./global/wsGlobal");
const url = require('url');
const { Routes, WebSocketConfig } = require("../configs");

const globalWebSocketDirectRoute = `/${Routes.webSocketRoute}/${Routes.wsGlobalRoute}`,
    gamePlayWebSocketDirectRoute = `/${Routes.webSocketRoute}/${Routes.wsGamePlayRoute}`;

let wsGlobalServer = GlobalWebSocket.Server(globalWebSocketDirectRoute),
    wsGamePlayServer = GamePlayWebSocket.Server(gamePlayWebSocketDirectRoute);

let mainClock = setInterval(() => {
    try {
        [wsGlobalServer, wsGamePlayServer].forEach(wss => {
            wss.collectGarbage();
        });

        console.log('garbages collected');
    } catch (err) {
        console.log(err);
    }
}, WebSocketConfig.MainClockInterval);

module.exports = {
    // setupGlobalWS,
    // setupGamePlayWS,
    mainClock,
    bindSocketsToMainServer: (server) => {
        server.on("upgrade", (request, socket, head) => {
            const pathname = url.parse(request.url).pathname;
            if (pathname === globalWebSocketDirectRoute) {
                wsGlobalServer.handleUpgrade(request, socket, head, (websocket) => {
                    // console.log('emitting on connection');
                    // const wsMiddlewares = Array.prototype.slice.call(arguments, 1);
                    // for (const method of wsMiddlewares) {
                    //     if (typeof(method) === 'function') {
                    //         console.log(`ws-middleware ${method.name} called`);
                    //         method();
                    //     }
                    // }
                    wsGlobalServer.emit("connection", websocket, request);
                });
            } else if (pathname === gamePlayWebSocketDirectRoute) {
                wsGamePlayServer.handleUpgrade(request, socket, head, (websocket) => {
                    wsGamePlayServer.emit("connection", websocket, request);
                });
            }
        });
    }
}