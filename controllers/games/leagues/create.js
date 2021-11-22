const LeagueModel = require("../../../models/leagues");

module.exports = async(req, res, next) => {
    try {
        const { Mode, title, capacity, prize } = req.body;
        const league = new LeagueModel({
            _mode: Mode,
            title,
            contesters: [],
            capacity,
            prize
        });
        await league.save();
        res.status(201).json({ msg: 'league created successfully' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}