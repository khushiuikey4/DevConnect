exports.getCurrentUser = (req, res) => {
    const dev = req.session.dev;
    if (dev) {
        return res.status(200).json({
            currentDev: dev
        })
    }
    return res.status(400).json({
        message: "Couldn't get current user maybe not logged in ."
    })
}