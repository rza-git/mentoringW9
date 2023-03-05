const express = require('express');
const app = express();
const port = 3000;
const router = require("./routes/index.js")
const errorHandler = require("./middlewares/errorhandler.js");
const swaggerUi = require("swagger-ui-express");
const gamesJson = require("./games.json")
const morgan = require("morgan")

app.use(morgan('tiny'));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(gamesJson));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(router);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})