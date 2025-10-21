const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const setuser = (user)=>{
    return jwt.sign({
        _id:user._id,
        username:user.username,
        email : user.email,
        role:user.role,
    },secret);
}

const getuser = (token)=>{
    if(!token){
        return;
    }
    return jwt.verify(token,secret);
};


module.exports = {setuser,getuser};