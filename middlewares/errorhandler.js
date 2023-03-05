function errorHandler(err, req, res, next) {
    console.log(err)
    if(err.name === "ErrorNotFound") {
        res.status(404).json({
            message: "Error Not Found"
        })
            
    } 
    else if(err.name === "WrongPassword") {
        res.status(400).json({
            message: "Wrong password or username"
        })
    }
    else if(err.name === "Unauthenticated") {
        res.status(400).json({
            message: "Unauthenticated"
        })
    }
    else if(err.name === "JWTerror") {
        res.status(400).json({
            message: "JWT Error"
        })
    }
    else if(err.name === "Unauthorized") {
        res.status(401).json({
            message: "Unauthorized"
        })
    }
    else {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
} 

module.exports = errorHandler;