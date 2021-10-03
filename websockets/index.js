const { setupGamePlayWS } = require("./gameplay/wsGamePlay");
const { setupGlobalWS } = require("./global/wsGlobal");
const url = require('url');
const { Routes } = require("../configs");

const globalWebSocketDirectRoute = `/${Routes.webSocketRoute}/${Routes.wsGlobalRoute}`,
    gamePlayWebSocketDirectRoute = `/${Routes.webSocketRoute}/${Routes.wsGamePlayRoute}`;
let wsGlobal = setupGlobalWS(globalWebSocketDirectRoute),
    wsGamePlay = setupGamePlayWS(gamePlayWebSocketDirectRoute);


module.exports = {
    setupGlobalWS,
    setupGamePlayWS,

    bindSocketsToMainServer: (server) => {
        server.on("upgrade", (request, socket, head) => {
            const pathname = url.parse(request.url).pathname;
            if (pathname === globalWebSocketDirectRoute) {
                wsGlobal.handleUpgrade(request, socket, head, (websocket) => {
                    // console.log('emitting on connection');
                    // const wsMiddlewares = Array.prototype.slice.call(arguments, 1);
                    // for (const method of wsMiddlewares) {
                    //     if (typeof(method) === 'function') {
                    //         console.log(`ws-middleware ${method.name} called`);
                    //         method();
                    //     }
                    // }
                    wsGlobal.emit("connection", websocket, request);
                });
            } else if (pathname === gamePlayWebSocketDirectRoute) {
                wsGamePlay.handleUpgrade(request, socket, head, (websocket) => {
                    wsGamePlay.emit("connection", websocket, request);
                });
            }
        });
    }
}