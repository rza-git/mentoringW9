const jwt = require("jsonwebtoken");
const secretKey = "RAHASIABANGET";
const pool = require("../config.js");

function authentication(req, res, next) {

    const {access_token} = req.headers;

    if(access_token) {
        // BERHASIL LOGIN
        try {
            const decoded = jwt.verify(access_token, secretKey);
            const {id, email, username} = decoded
            const findUser = `
                SELECT
                    *
                FROM users
                WHERE id = $1;
            `

            pool.query(findUser, [id], (err, result) => {
                if(err) next(err);

                if(result.rows.length === 0) {
                    // NOT FOUND
                    next({name: "ErrorNotFound"})
                } else {
                    // FOUND USER
                    // BERHASIL LOLOS AUTHENTICATION
                    const user = result.rows[0]

                    req.loggedUser = {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        is_admin: user.is_admin
                    }
                    next();
                }
            })
        } catch(err) {
            next({name: "JWTerror"})
        }
    } else {
        // GAGAL LOGIN
        next({name: "Unauthenticated"})
    }
}

function authorization(req, res, next) {
   
    console.log(req.loggedUser);
    const {is_admin, username, email, id} = req.loggedUser;

    if(is_admin) {
        // Authorized --> boleh eksekusi
        next();
    } else {
        // Unauthorized
        next({name: "Unauthorized"})
    }
}

module.exports = {
    authentication,
    authorization
}