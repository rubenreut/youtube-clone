const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//create new user route

router.post('/register', async (req, res) => {
    try{
        //get user input
        const{username, email, password, channelName} = req.body;

        //check if user already exists

        const emailExists = await User.findOne({email});

        if(emailExists){
            return res.status(400).json({error:'Email already registered'});
        }

        //encrypt/hash the password using bcrypt

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        //create new user

        const user = new User({
            username, 
            email,
            password: hashedPassword,
            channelName
        });

        //save to database
        const savedUser = await user.save();

        //create and send toke 
        const token = jwt.sign(
            {_id: savedUser._id},
            process.env.JWT_SECRET
        );

        res.json({
            message: 'User created successfully',
            token,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                channelName: savedUser.channelName
            }
        });


    } catch(error){
        res.status(500).json({error: error.message});
    }
});

//LOGIN ROUTE
router.post('/login', async (req, res) => {
    try{
        //GET USER INPUT
        const{email, password} = req.body;

        //check if user exists
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({error: 'Email or password is wrong'});
        }

        //verify password
        const validPassword = await bcrypt.compare(password, user.password);

        if(!validPassword){
            return res.status(400).json({ error: 'Email or password is wrong'});
        }

        //create and send token
        const token = jwt.sign(
            {_id: user._id},
            process.env.JWT_SECRET
        );

        res.json({
            message: 'Logged in succesfully!',
            token,
            user: {
                id: user._id,
                username: user.username,
                channelName: user.channelName
            }
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;