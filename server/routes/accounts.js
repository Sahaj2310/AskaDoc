require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const { MongoClient } = require('mongodb');

const uri = process.env.MongoConnectionString;
const router = express.Router();
const client = new MongoClient(uri);

let uniqueName = "";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './client/src/assets/images/profileImages');
    },
    filename: function (req, file, cb) {
        let spiltName = file.originalname.split('.');
        uniqueName = `${spiltName[0]}-${Date.now()}.${spiltName[1]}`;
        cb(null, uniqueName);
    }
})

const upload = multer({ storage: storage })


router.get('/GToE', async function (req, res, next) {
    let database = client.db('users');
    let coll = database.collection('doctors');

    let data = await coll.aggregate([
        {
            $match: {
                specialization: { $ne: "" }
            }
        },
        {
            $sort: { reputation: -1 }
        },
        {
            $group: {
                _id: "$specialization",
                name: { $first: "$username" },
                imgsrc: { $first: "$ProfileImg" }
            }
        }
    ]).toArray();
    res.send(data);
});

router.get("/:username", async (req, res) => {
    let username = req.params.username;

    let database = client.db('users');
    let coll = database.collection('doctors');

    let info = await coll.findOne({ username: username });
    if (info) {
        res.json(info);
    }
    else {
        res.json("Invalid");
    }
});

router.post('/:username', upload.single('profilepic'), async (req, res) => {

    let database = client.db('users');
    let coll = database.collection('doctors');
    let username = req.params.username;

    await coll.updateOne({ username: username }, {
        $set: {
            ProfileImg: uniqueName,
            specialization: req.body.specialization,
            qualification: req.body.qualification,
            experience: req.body.experience,
            languages: req.body.languages,
            tel: req.body.phonenumber,
            email: req.body.email,
            fees: req.body.fees
        }
    });
    res.redirect("http://localhost:3000/home/categories");
})

router.get('/specialization/:specName', async function (req, res, next) {
    let database = client.db('users');
    let coll = database.collection('doctors');

    let catagory = req.params.specName;

    let data = await coll.aggregate([
        {
            $match: {
                specialization: { $eq: catagory }
            }
        },
        {
            $project: {
                username: 1,
                ProfileImg: 1,
                specialization: 1,
                reputation: 1,
                fees: 1,
            }
        }
    ]).toArray();
    res.send(data);
});

module.exports = router;