import mongoose from "mongoose";

const {Schema} = mongoose;
const ProblemSchema = new Schema({
    problemId:{
        type:String,
        index:true,
        unique:true
    },
    title:{
        type:String,
        index:true,
    },
    url:{
        type:String
    },
    companies:[{
        type:String,
        required:true
    }],
    difficulty:{
        type:String,
        index:true
    },
    topics:{
        type:String,
        enum:["Easy","Medium","Hard"],
        default:["Medium"]
    },
    acceptance:{
        type:Number
    }
},{timestamps:true});

ProblemSchema.set('toJSON', {
    transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);
export default Problem;