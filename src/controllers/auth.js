const authServices = require("../services/auth");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { name, phoneNumber, password } = req.body;
        const user = await authServices.createUser({ name, phoneNumber, password });
        
        return res.status(201).json({
            message: "User has been created, please login to continue",
            data: {
                user,
            },
        });
    } catch (error) {
        return res.status(error.code || 500).json({
            message: error.message,
        });
    }
};
exports.login = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        const user = await authServices.authorizeUser({ phoneNumber, password });

        const token = jwt.sign({ userID: user.userID, phoneNumber: user.phoneNumber, role: user.role }, process.env.JWTSECRET);

        return res.status(200).json({
            message: "User has been logged in",
            token: "Bearer " + token,
            data: {
                userID: user.userID,
                phoneNumber: user.phoneNumber,
                name: user.name,
                address: user.address,
                role: user.role,
                email: user.email,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(error.code || 500).json({
            message: error.message,
        });
    }
};
