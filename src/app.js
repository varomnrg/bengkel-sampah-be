require("dotenv").config();
const express = require("express");
const port = process.env.PORT;
const router = require("./routes");

const app = express();

const passport = require("passport");
const strategy = require("./config/auth");

passport.use(strategy);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});

app.use(router);

app.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.send("Hello, " + req.user.name + "!");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
