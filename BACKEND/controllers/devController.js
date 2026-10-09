const Dev = require("../models/dev")
exports.getDev = async (req, res) => {
    const id = req.params.id;
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
        let devList = await Dev.find();
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
    const { id } = req.params;
    const updatedValues = req.body;


    try {
        const dev = await Dev.findByIdAndUpdate(
            id,
            updatedValues,
            { new: true, runValidators: true }
        );

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
    const { id } = req.params;


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
