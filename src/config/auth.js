const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const pool = require("./db");
const { NotFoundError } = require("../utils/errors");

let jwtOptions = {};

jwtOptions.secretOrKey = process.env.JWTSECRET;
jwtOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();

module.exports = new JwtStrategy(jwtOptions, async (token, done) => {
    const user = await pool.query('SELECT "userID", "phoneNumber", name, address, role, email, "createdAt" FROM "User" WHERE "userID" = $1', [token.userID]);
    const userData = user.rows[0];
    if (!userData) return done(new NotFoundError("User not found"), null);

    return done(null, userData);
});
