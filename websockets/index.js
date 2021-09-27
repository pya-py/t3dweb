const { setupGamePlayWS} = require("./gameplay/wsGamePlay");
const {  setupGlobalWS } = require("./global/wsGlobal");
const url = require('url');

let wsGlobal = setupGlobalWS("/global"), wsGamePlay = setupGamePlayWS("/gameplay");


module.exports = {
    setupGlobalWS,
    setupGamePlayWS,

    bindSocketsToMainServer: (server) => {
        server.on("upgrade", (request, socket, head) => {
            const pathname = url.parse(request.url).pathname;
            if (pathname === "/global") {
                wsGlobal.handleUpgrade(request, socket, head, (websocket) => {
                    wsGlobal.emit("connection", websocket, request);
                });
            } else if (pathname === "/gameplay") {
                wsGamePlay.handleUpgrade(request, socket, head, (websocket) => {
                    wsGamePlay.emit("connection", websocket, request);
                });
            }
        });
    }
}