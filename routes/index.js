const express = require("express")
const router = express.Router();
const gamesRouter = require("./games.js")
const pool = require("../config.js");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const jwt = require("jsonwebtoken");
const secretKey = "RAHASIABANGET"
const {authentication} = require("../middlewares/auth.js");

router.post("/login", (req, res, next) => {
    const {username, password} = req.body;

    const findUser = `
        SELECT 
        *
        FROM users
        WHERE username = $1
    `

    pool.query(findUser, [username], (err, result) => {
        if (err) next(err)

        if(result.rows.length === 0) {
            // NOT FOUND
            next({name: "ErrorNotFound"})
        } else {
            // FOUND
            const data = result.rows[0]
            const comparePassword = bcrypt.compareSync(password, data.password);

            if(comparePassword) {
                // PASSWORD BENAR
                const accessToken = jwt.sign({
                    id: data.id,
                    username: data.username,
                    email: data.email
                }, secretKey)

                res.status(200).json({
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    is_admin: data.is_admin,
                    accessToken: accessToken
                })
            } else {
                // PASSWORD SALAH
                next({name: "WrongPassword"})
            }
        }
    })
})

router.post("/register", (req, res, next) => {
    const {username, email, password, is_admin} = req.body;
   
    const hash = bcrypt.hashSync(password, salt);

    const insertUser = `
        INSERT INTO users (username, email, password, is_admin)
            VALUES
            ($1, $2, $3, $4);
    `

    pool.query(insertUser, [username, email, hash, is_admin], (err, result) => {
        if(err) next(err)
        res.status(201).json({
            message: "User registered"
        });
    })
})


router.use(authentication)
router.use("/", gamesRouter)

module.exports = router;