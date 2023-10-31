const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { NotFoundError, UnauthorizedError } = require("../utils/errors");

exports.getUserbyPhoneNumber = async (phoneNumber) => {
    const user = await pool.query('SELECT * FROM "User" WHERE "phoneNumber" = $1', [phoneNumber]);
    if (!user.rows[0]) throw new Error("User not found");
    return user.rows[0];
};

exports.createUser = async ({ name, phoneNumber, password }) => {
    const isExist = await pool.query('SELECT * FROM "User" WHERE "phoneNumber" = $1', [phoneNumber]);
    if (isExist.rows[0]) throw new Error("User already exist");

    const userID = uuidv4();

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await pool.query('INSERT INTO "User"("userID", name, "phoneNumber", "passwordHash") VALUES($1, $2, $3, $4) RETURNING "userID", "phoneNumber", name, address, role, email, "createdAt"', [userID, name, phoneNumber, passwordHash]);

    return user.rows[0];
};

exports.authorizeUser = async ({ phoneNumber, password }) => {
    const user = await this.getUserbyPhoneNumber(phoneNumber);

    if (!user) throw new NotFoundError("User not found");

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) throw new UnauthorizedError("Password is incorrect");

    return user;
};

exports.checkUserToken = async (userID) => {
    const token = await pool.query('SELECT * FROM "Token" WHERE "userID" = $1', [userID]);
    if (!token.rows[0]) return false;
    return true;
};

exports.getToken = async (refreshToken) => {
    const token = await pool.query('SELECT * FROM "Token" WHERE "token" = $1', [refreshToken]);
    if (!token.rows[0]) throw new UnauthorizedError("Invalid refresh token");
    return token.rows[0];
};

exports.generateAuthTokens = async (payload) => {
    const tokenExist = await this.checkUserToken(payload.userID);

    if (tokenExist) await pool.query('DELETE FROM "Token" WHERE "userID" = $1', [payload.userID]);

    const accessToken = jwt.sign(payload, process.env.JWTSECRET, { expiresIn: "2h" });
    const refreshToken = jwt.sign({}, process.env.JWTSECRET, { expiresIn: "30d" });

    let expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + 30);
    expiresIn = expiresIn.getTime() / 1000;

    await pool.query(`INSERT INTO "Token"("token", "userID", "expDate") VALUES($1, $2, to_timestamp(${expiresIn}))`, [refreshToken, payload.userID]);

    return [accessToken, refreshToken];
};

exports.refreshAccessToken = async (refreshToken) => {
    const token = await this.getToken(refreshToken);

    if (token.expDate < new Date()) throw new UnauthorizedError("Refresh token expired");

    const userData = await pool.query('SELECT "userID", role FROM "User" WHERE "userID" = $1', [token.userID]);

    const user = userData.rows[0];

    const payload = {
        userID: user.userID,
        role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWTSECRET, { expiresIn: "2h" });

    return accessToken;
};
