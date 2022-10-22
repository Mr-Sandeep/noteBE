const dbConnection = require('../model/connection');

let serviceLayer = {};


serviceLayer.checkUserEmail = async(email) => {
    try {
        let connectDb = await dbConnection.connectDB();
        let result = await connectDb.findOne({email});
        return result;
    } catch (err) {
        throw new Error("New email check failed");
        err.status = 500
    }
}


serviceLayer.registerUser = async(user)=> {
    try {
        // console.log(user);
        let connectDb = await dbConnection.connectDB();
        let result = await connectDb.insertMany(user);
        if(result){
            return result;
        }else{
            return false;
        }
    } catch (err) {
        throw new Error(err)
    }
}


serviceLayer.getNotes = async(email) => {
    try {
        let connectToDB = await dbConnection.connectDB();
        let getResult = await connectToDB.findOne({"email":email},{"notesArr":1, "_id":0});
        return getResult;
    } catch (err) {
        throw new Error(err);
        err.status = 500;
    }
}

serviceLayer.saveNote = async(email,title, desc) => {
    try {
        let note = {
            "noteTitle" : title,
            "noteDesc" : desc
        }
    
        let connectToDB = await dbConnection.connectDB();
        let insertData = await connectToDB.updateOne({"email":email},{$push:{notesArr:note}});

        if(insertData){
            return true;
        }else{
            return false;
        }
    } catch (err) {
        console.error(err);
        throw new Error("Server error in saving");
        err.status = 500
    }
}

serviceLayer.deleteNote = async (email, title) => {
    try {
        // console.log(email, title);
        let conn = await dbConnection.connectDB();
        let deletion = await conn.updateOne(
            {"email":email},
            {$pull:{"notesArr": {"noteTitle": title}}});
        // console.log(deletion);
        return deletion;
    } catch (error) {
        console.error(error);
        error.status = 500;
        throw new Error("Server error while deletion");
       
    }
}

serviceLayer.updateNote = async (email, title, desc, _id) => {
    try {
        // console.log(email, title, desc, _id);
        let conn = await dbConnection.connectDB();
        const query = { "email": email, "notesArr._id": _id};
        const updateDoc = {$set:{"notesArr.$.noteTitle":title, "notesArr.$.noteDesc": desc}};
        let updation = await conn.updateOne(query, updateDoc);
        return updation;
    } catch (error) {
        console.error(error);
        error.status = 500;
        throw new Error("Server error while deletion");
       
    }
}
serviceLayer.updateNote("sonisandeep@gmail.com", "updated testing", "updation this is testing", "6353f10ab4fbeae248d2a8c1");
module.exports = serviceLayer;