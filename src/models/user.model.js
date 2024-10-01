import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


const userSchema = new Schema(
    {
        userName:{
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar:{
            type: String, //will get from cloudnary
            required: true
        },
        coverImage:{
            type: String, //will get from cloudnary
            
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type: String,
            required: [true, "Password is Reuired"]
        },
        refreshToken:{
            type: String
        },
        accessToken:{
            type: String
        }
    },{timestamps: true}
)

//before saving data password will be hashed here
userSchema.pre("save", async function(next){  // rrow func not allowed
    if(!this.isModified("password")){  //isModified inbuilt method of pre or mongoose middleware
        return next() //condition to check if password is modified or else on every compile it will run
    }

  return  this.password = await bcrypt.hash(this.password, 10)  //bcrypt.hash("String", no of salt rounds)

})


//custom eventis written to check if password matches
userSchema.methods.isPasswordCorrect = async function(password){
const value = await bcrypt.compare(password, this.password)

   return await bcrypt.compare(password, this.password)
}

//method to genrate accesstokens

userSchema.methods.genrateAccessToken = function(){
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            userName:this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.genrateRefreshToken = function(){
    return jwt.sign( // requires payload, secretkey and expirytime
        {
            id: this._id  //payload
        },
        process.env.REFRESH_TOKEN_SECRET, //secretkey defined in env
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY  //expirytime
        }
    )
}





export const User = mongoose.model("User", userSchema)