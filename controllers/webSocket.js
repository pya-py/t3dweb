const WebSocket = require("ws");

var wss = undefined;
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
        if(wss.clients.size <= 2)
            ws.send((wss.clients.size - 1).toString());
    });
};
