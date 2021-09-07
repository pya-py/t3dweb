const WebSocket = require("ws");

var wss = undefined;
var turn = 0;
module.exports.setupWS = (server) => {
    wss = new WebSocket.Server({ server });
    wss.on("connection", (ws) => {
        ws.on("message", (data) => {
            wss.clients.forEach((client) => {
                // console.log(data.toString());
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(data.toString());
                }
            });
        });
        console.log(turn);
        ws.send(turn.toString());
        turn = (turn + 1) % 2;
    });
};
