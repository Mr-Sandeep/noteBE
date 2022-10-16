const express = require('express');
const gravator = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator')
const service = require('../service/service');
const auth = require('../middleware/auth');
const routing = express.Router();

routing.get('/', async (req, res, next)=>{
    try {
        res.send("<h1>It is working</h1>")
    } catch (err) {
        err.status = 500;
        throw new Error("deploy error");
    }
});

routing.post('/registerUser',[
    check('name', "Name is required").not().isEmpty(),
    check('email',"Email is required").not().isEmpty(),
    check('password', "Password is required").not().isEmpty()
], async (req, res, next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.json({errors: errors.array()}).status(400);
        }

        const {name, email, password} = req.body;

        try {
            let existUser = await service.checkUserEmail(email);
            if(existUser){
                return res.json({msg: "User already exist.", status:"FAILED", data: null})
            }
            const avatar = gravator.url(email, {
                s : '200',
                r: 'pg',
                d: 'mm'
            });

            const salt = await bcrypt.genSalt(10);
            
            newUser = {
                name : name,
                password: password,
                email : email,
                avatar : avatar,
                notesArr : []
            }

            newUser.password = await bcrypt.hash(password, salt);

            let registerUser = await service.registerUser(newUser);
            // console.log(registerUser);
            // res.json(registerUser);
            if(registerUser){
                // const payload = {
                //     email:{
                //         newUser:email
                //     }
                // }
                // jwt.sign(payload, 'mysecrettoken', {expiresIn:5000}, (err, token)=>{
                //     if(err) throw err;
                //     res.json({token})
                // })
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.json({msg:"User registered successfully", status: "SUCCESS", data: []})
            }else{
                res.status(500).json({msg: "User registration failed", status: "FAILED", data: []})
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
});

routing.post('/login',[
    check('email', "Email is required.").not().isEmpty().isEmail(),
    check('password', "Password is required").not().isEmpty()
], async(req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    try {
        let checkUser = await service.checkUserEmail(email);
        if(!checkUser){
            return res.json({msg: 'Invalid credentials.', status:"FAILED", data: null});
        }

        const isMatch = await bcrypt.compare(password, checkUser.password);
        if(!isMatch){
            return res.json({msg: 'Invalid credentials.', status:"FAILED", data: null});
        }

        const payload = {
            email:email
        }
        
        jwt.sign(payload, 'mysecrettoken', {expiresIn:5000}, (err, token)=>{
            if(err) throw err;
            // res.setHeader('x-token', token)
            // res.set("Content-Type", "text/html");
            // res.setHeader("x-token", token);
            // res.header("Access-Control-Allow-Headers", "x-token");
            // res.cookie("x-token", token, {domain:"localhost", path:'/',secure: true, maxAge: 15000});
            res.json({data: null,status: 'SUCCESS', msg:'Logged in successfully', auth: token})
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error while loging"); 
    }
})

routing.get('/getNotes', auth,async (req, res, next)=>{
    try {
        let getAllNotes = await service.getNotes(req.email);
        if(getAllNotes){
            res.json({msg: `Data retrived successfully`, status:"SUCCESS", data: getAllNotes})
        }
    } catch (errr) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }

});

routing.put('/savedNotes',[auth,
    check('noteTitle', "Title is required")
    .not()
    .isEmpty(),
    check('noteDesc', "Description is required")
    .not()
    .isEmpty()
    ],async (req, res, next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
    try {
        let nTitle = req.body.noteTitle;
        let nDesc = req.body.noteDesc;
        let savedResp = service.saveNote(req.email,nTitle, nDesc);
        if(savedResp){
            res.json({msg: `Data saved successfully`, status: 'SUCCESS'});
        }else{
            res.json({msg: `Data saved successfully`, status: 'FAILED'});
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

routing.post('/deleteNote', [auth, check('noteTitle').not().isEmpty()], async (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status = 400;
        res.json({errors: errors.array()});
    }
    try {
        let title = req.body.noteTitle;
        // console.log(title);
        let deleteNote = await service.deleteNote(req.email, title);
        if(deleteNote){
            res.json({msg: `${title} deleted successfully`, status: 'SUCCESS', data: null});
        }else{
            res.status = 500;
            res.json({msg: `Something went wrong. Please after sometimes.`, status: 'FAILED', data: null});
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

routing.post('/editNote', [auth, check('noteTitle').not().isEmpty(),check('noteDesc').not().isEmpty()], async (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status = 400;
        res.json({errors: errors.array()});
    }
    try {
        // console.log("request body ", req.body);
        let title = req.body.noteTitle;
        let desc = req.body.noteDesc;
        let noteId = req.body._id;
        // console.log(title);
        let updateNote = await service.updateNote(req.email, title, desc, noteId);
        if(updateNote.modifiedCount>0){
            res.json({msg: `${title} updated successfully`, status: 'SUCCESS', data: null});
        }else{
            res.status(500);
            res.json({msg: `Something went wrong. Please after sometimes.`, status: 'FAILED', data: null});
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = routing;