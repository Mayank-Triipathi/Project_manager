const mongoose = require("mongoose");
const connecttomdb = async (url)=>{
    await mongoose.connect(url);
};

module.exports = {connecttomdb};