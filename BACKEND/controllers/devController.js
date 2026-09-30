exports.getHomePage = (req, res) => {
    if (req.session.isLoggedIn === true) {
        return res.status(200).json({
            message: "user is logged in and can view the home page"
        })
    }
    return res.status(400).json({
        message: "user is not logged in."
    })
}