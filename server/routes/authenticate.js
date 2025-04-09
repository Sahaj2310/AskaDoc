require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let router = express.Router();

router.get('/', (req, res) => {
    let token = req.headers['authorization'].split(" ")[1];

    jwt.verify(token, process.env.TOKEN_ACCESS_KEY, (err, user) => {
        if(err) res.send(false);

        res.json(user);
    })  
})

module.exports = router;