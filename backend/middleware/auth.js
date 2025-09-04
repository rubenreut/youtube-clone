const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    //get token from header
    const token = req.header('auth-token');

    if(!token){
        return res.status(401).json({error: ' Access Denied'});
    }

    try{
        //verify token 
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.userID = verified._id;
        next();
    }
    catch (error){
        res.status(400).json({error: 'invalid token'});
    }
};

module.exports = verifyToken;