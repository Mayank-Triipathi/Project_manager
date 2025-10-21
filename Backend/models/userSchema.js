const {mongoose,model} = require("mongoose");
const {createHmac,randomBytes} = require("crypto");
const {setuser} = require("../services/auth")

const userschema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    salt:{
        type:String,
    },
    profileImageURL:{
        type:String,
        required:true,
        default:"/uploads/default.webp",
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER",
    },
},{timestamps:true});


userschema.pre("save",function(next){
    const user = this;
    if(!user.isModified("password")) return next();
    const salt  = randomBytes(16).toString("hex");
    const hashedPassword = createHmac("sha256",salt).update(user.password).digest("hex");
    user.salt  = salt;
    user.password = hashedPassword;

    next();
})

userschema.static("matchuserandgettoken",async function(email,password){
    const user = await this.findOne({email});
    if(!user) throw new Error("user not found") ;
    const salt = user.salt;
    const hashedPassword = user.password;
    const userprovidedpass = createHmac("sha256",salt).update(password).digest("hex");

    if(hashedPassword!==userprovidedpass){
        throw new Error("password not matched") ;
    }
    const token = setuser(user);
    return token;
})

const User  = model("users",userschema);
module.exports = {User};