const Dev = require('../models/dev')
exports.getCurrentUser = async (req, res) => {
    const dev = await Dev.findById(req.session.dev._id).select("-password");
    if (dev) {
        return res.status(200).json({
            currentDev: dev
        })
    }
    return res.status(400).json({
        message: "Couldn't get current user maybe not logged in ."
    })
}