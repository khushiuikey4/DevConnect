const Dev = require("../models/dev")
exports.getDev = async (req, res) => {
    if (!req.session?.dev?._id) {
        return res.status(401).json({
            message: "Please log in first."
        });
    }
    const id = req.session.dev._id;
    const dev = await Dev.findById(id).select("-password");
    try {
        const dev = await Dev.findById({ _id: id });
        if (!dev) {
            return res.status(404).json({
                message: "Dev(user) not found."
            });
        }
        return res.status(200).json({
            message: "dev(user) found successfully.",
            dev: dev
        })
    } catch (error) {
        return res.status(400).json({
            error: error,
            message: "Error in finding the dev(user)"
        })
    }
}
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
            success: false,
            message: "Please log in first."
        });
    }

    try {
        const id = req.session.dev._id;

        // Your frontend already packed all profile fields here.
        const updatedValues = JSON.parse(req.body.fields);

        const removeAvatar = req.body.removeAvatar === "true";

        const dev = await Dev.findById(id);

        if (!dev) {
            return res.status(404).json({
                success: false,
                message: "Dev not found."
            });
        }

        // Apply the profile fields sent by the frontend.
        const allowedFields = [
            "username",
            "bio",
            "location",
            "website",
            "socialLinks"
        ];

        for (const field of allowedFields) {
            if (updatedValues[field] !== undefined) {
                dev[field] = updatedValues[field];
            }
        }

        // Save the URL/path for the uploaded avatar.
        if (req.file) {
            dev.avatar = `/uploads/${req.file.filename}`;
        } else if (removeAvatar) {
            dev.avatar = "";
        }

        await dev.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            dev: await Dev.findById(id).select("-password")
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error updating profile.",
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
    const dev = await Dev.findById(id).select("-password");
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
        return res.status(400).json({
            message: "Error deleting dev",
            error: error.message
        });
    }
};
