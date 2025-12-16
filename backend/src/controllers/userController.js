import User from "../models/User.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

export const signup = async(req,res)=>{
    try {
        const {name,email,password} = req.body;


        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.staus(400).json({
                ok: false,
                message:"User already exists"
            });
        }
        const passwordHash = await bcrypt.hash(password,10);

        const user =await User.create({name,email,passwordHash});

        res.status(200).json({
            ok:true,
            message:"User created successfully!",
            data:{id:user._id, name:user.name, email:user.email}
        });
    } catch (error) {
        return res.status(500).json({
            ok:false,
            message:"Signup failed",
            error:error.message
        })
    }
}

export const login =async(req,res)=>{
    try{
        const {email,password}=req.body;

        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({
                ok:false,
                message:"User doesnot exist in db",
            })
        }
        const isMatch =  await bcrypt.compare(password,user.passwordHash);
        if(!isMatch){
            return res.status(404).json({
                ok:false,
                message:"Password doesnot match",
            })
        }
        const token = jwt.sign({
            id:user._id,email:user.email,isAdmin:user.isAdmin
        },process.env.JWT_SECRET,{expiresIn: "7d"});

        res.json({
            ok:true,
            message:"Login Successfull",
            token,
            data:{id:user>_id,name:user.name,email:user.email}
        });
    }
    catch(error){
        return res.status(500).json({
            ok:false,
            message:"Internal server error!!",
            error:error.message
        })
    }
}

//user attempt route

export const upsertAttempt = async(req,res)=>{
    try {
        const {userId} = req.body;
        const attemptObj = req.body;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                ok:false,
                message:"User not found",
            })
        }
        await user.usertAttempt(attemptObj);
    } catch (error) {
        return res.status(500).json({
            ok:false,
            message:"Some error has occured in usertAttempt",
            error:error.message
        })
    }
}