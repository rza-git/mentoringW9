const express = require("express")
const router = express.Router();
const pool = require("../config.js");
const {authorization} = require("../middlewares/auth.js");
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

router.get("/games", (req, res, next) => {
   console.log(req.query);
   const {limit, page} = req.query;

   let resultLimit = limit ? +limit : DEFAULT_LIMIT;
   let resultPage = page ? +page : DEFAULT_PAGE;

   const findQuery = `
        SELECT 
            *
        FROM games
        ORDER BY games.id
        LIMIT ${resultLimit} OFFSET ${(resultPage - 1) * resultLimit}
   `

   pool.query(findQuery, (err, result) => {
        if(err) next(err)
        
        res.status(200).json(result.rows);
   })
})

router.get("/games/:id", (req, res, next) => {

    const {id} = req.params;
    
    const findOneQuery = `
        SELECT
        *
        FROM games
        WHERE games.id = $1
    `

    pool.query(findOneQuery, [id], (err, result) => {
        if (err) next(err)

        if(result.rows.length === 0) {
            // NOT FOUND
            next({name: "ErrorNotFound"})
        } else {
            // FOUND
            res.status(200).json(result.rows[0]);
        }
    })
})

router.post("/games", authorization, (req, res, next) => {
    const {id, title, developer, year, genres} = req.body;
    
    const createGame = `
        INSERT INTO games (title, developer, year, id)
            VALUES
                ($1, $2, $3, $4)
        RETURNING *;
    `

    pool.query(createGame, [title, developer, year, id], (err, result) => {
        if(err) next(err)
        
        const data = result.rows[0]
        let insertGenres = `
            INSERT INTO game_genres (game_id, genre_id)
                VALUES
        `

        for (let i = 0; i < genres.length; i++) {
            let temp = `(${data.id}, ${genres[i]})`
            if (i === genres.length - 1) {
                temp += ';'
            } else {
                temp += ','
            }

            insertGenres += temp;
        }

        pool.query(insertGenres, (err, result) => {
            if(err) next(err)

            res.status(201).json({
                message: "Games created successfully"
            })
        })
    })
})


router.put("/games/:id", (req, res, next) => {
    const {id} = req.params;
    const {title, developer} = req.body;

    const updateGame = `
        UPDATE games
        SET title = $1,
            developer = $2
        WHERE id = $3;
    `

    pool.query(updateGame, [title, developer, id], (err, result) => {
        if(err) next(err)

        res.status(200).json({
            message: "Updated successfully"
        })
    })
})

router.delete("/games/:id", (req, res, next) => {

    const {id} = req.params;
    console.log(id)
    const deleteGameGenres = `
        DELETE FROM game_genres
        WHERE game_id = $1;
    `

    pool.query(deleteGameGenres, [id], (err, result) => {
        if(err) next(err)

        const deleteGame = `
            DELETE FROM games
            WHERE id = $1;
        `
        // CASCADE
        pool.query(deleteGame, [id], (err, result) => {
            if(err) next(err)

            res.status(200).json({
                message: "Game deleted successfully"
            })
        })
    })
})



module.exports = router;