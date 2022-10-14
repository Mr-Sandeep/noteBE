const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const connectionUrl = require('../utilities/constant');

let schema = {
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    notesArr: [
        {
            noteTitle:{
                required: true,
                type: String
            },
            noteDesc:{
                required: true,
                type: String
            }
        }
    ],
    date:{
        type : Date,
        default : Date.now
    }
};

let connection = {};
let noteSchema = new Schema(schema, {collection : "Notes", timestamps: true});
connection.connectDB = async() => {
    try {
        await mongoose.connect(connectionUrl, {
            useNewUrlParser: true
        });
        console.log("connected to db");
        let connectionModel = await mongoose.model("Notes", noteSchema);
        return connectionModel;
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}

// connection.connectDB();
module.exports = connection;