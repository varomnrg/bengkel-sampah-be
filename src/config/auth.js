const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const pool = require("./db");

let jwtOptions = {};

jwtOptions.secretOrKey = process.env.JWTSECRET;
jwtOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();

module.exports = new JwtStrategy(jwtOptions, async (token, done) => {
    const user = await pool.query('SELECT "userID", "phoneNumber", name, address, role, email, "createdAt" FROM "User" WHERE "phoneNumber" = $1', [token.phoneNumber]);
    const userData = user.rows[0];
    if (!userData) return done(new Error("User not found"), null);

    return done(null, userData);
});
