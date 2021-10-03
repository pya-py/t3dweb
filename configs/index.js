const T3D = require('./game-t3d');
const serverRoutes = require('./server-routes');
const PayloadRequirements = require('./requirements');
module.exports = {
    Routes: serverRoutes,
    GameRules: { T3D },
    PayloadRequirements
}