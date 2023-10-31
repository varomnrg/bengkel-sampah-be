const authServices = require("../services/auth");

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

        const jwtPayload = {
            userID: user.userID,
            role: user.role,
        };

        const [accessToken, refreshToken] = await authServices.generateAuthTokens(jwtPayload);

        return res.status(200).json({
            message: "User has been logged in",
            accessToken: "Bearer " + accessToken,
            refreshToken,
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

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const accessToken = await authServices.refreshAccessToken(refreshToken);

        return res.status(200).json({
            message: "Access token has been refreshed",
            accessToken: "Bearer " + accessToken,
        });
    } catch (error) {
        return res.status(error.code || 500).json({
            message: error.message,
        });
    }
};
