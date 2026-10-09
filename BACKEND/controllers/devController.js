const Dev = require("../models/dev")
exports.getDev = async (req, res) => {
    if (!req.session?.dev?._id) {
        return res.status(401).json({
            message: "Please log in first."
        });
    }

    const id = req.session.dev._id;

    try {
        const dev = await Dev.findById(id).select("-password");

        if (!dev) {
            return res.status(404).json({
                message: "Dev(user) not found."
            });
        }

        return res.status(200).json({
            message: "dev(user) found successfully.",
            dev
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error in finding the dev(user)",
            error: error.message
        });
    }
};
exports.getAllDevs = async (req, res) => {
    try {
        const devList = await Dev.find().select("-password");
        return res.status(200).json({
            message: "Dev list fetched successfully.",
            devList: devList
        })

    } catch (error) {
        return res.status(400).json({
            error: error,
            message: "Error in fetching all devs(users)"
        })
    }
}
exports.updateDev = async (req, res) => {
    if (!req.session?.dev?._id) {
        return res.status(401).json({
            message: "Please log in first."
        });
    }

    const id = req.session.dev._id;

    try {
        const { username, bio, location, website, socialLinks } = req.body;

        const updatedValues = {
            username,
            bio,
            location,
            website,
            socialLinks
        };

        const dev = await Dev.findByIdAndUpdate(
            id,
            updatedValues,
            { new: true, runValidators: true }
        ).select("-password");

        if (!dev) {
            return res.status(404).json({
                message: "Dev not found"
            });
        }

        return res.status(200).json({
            message: "Dev updated successfully",
            dev
        });
    } catch (error) {
        return res.status(400).json({
            message: "Error updating dev",
            error: error.message
        });
    }
};
exports.deleteDev = async (req, res) => {
    if (!req.session?.dev?._id) {
        return res.status(401).json({
            message: "Please log in first."
        });
    }

    const id = req.session.dev._id;

    try {
        const dev = await Dev.findByIdAndDelete(id);

        if (!dev) {
            return res.status(404).json({
                message: "Dev not found"
            });
        }

        return res.status(200).json({
            message: "Dev deleted successfully",
            dev
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting dev",
            error: error.message
        });
    }
};