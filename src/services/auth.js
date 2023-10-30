const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
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

exports.comparePassword = async (password, hashedPassword) => {
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    return isPasswordMatch;
};

exports.authorizeUser = async ({ phoneNumber, password }) => {
    const user = await this.getUserbyPhoneNumber(phoneNumber);

    if (!user) throw new NotFoundError("User not found");

    const isPasswordMatch = await this.comparePassword(password, user.passwordHash);
    if (!isPasswordMatch) throw new UnauthorizedError("Password is incorrect");

    return user;
};
