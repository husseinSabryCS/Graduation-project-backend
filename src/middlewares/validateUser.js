const session = require("express-session");
const JWT = require("jsonwebtoken");
const secret = "huu123";
const validateUser = async (req, res , next) => {
  try {
    
    const  token= req.session.token 

    if(!token){
        return res.status(401).json({msg :" not auth ", login :false})
    }
   JWT.verify(token.split(" ")[1],secret,async(error,decode)=>{
 if(error){
    return res.status(401).json({msg :" not auth ", login :false})
 }
 req.id=decode.id
 req.name=decode.name
 req.role=decode.role
 req.national_id=decode.national_id
 if(req.role!=0){
    return res.status(401).json({msg :" not auth ", login :false})
 }
 next()
})

  } catch (error) {
    console.log(error);
  }
};
module.exports=validateUser;