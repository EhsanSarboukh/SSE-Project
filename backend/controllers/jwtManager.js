require('dotenv').config();
const jsonwebtoken = require("jsonwebtoken")

const jwtManager = (user)=>
{
    const accessToken =  jsonwebtoken.sign(
        {
            _id: user._id,  // Use _id instead of id
            name:user.username,

        },
        process.env.jwt_salt
    );

    return accessToken;

}



module.exports = jwtManager;