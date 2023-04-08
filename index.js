const express = require('express')
const app = express()
const crypto = require('crypto')

require('dotenv').config()
app.use(express.json())

const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URL)
client.connect()

function generateRandomId(length) {
    const bytes = crypto.randomBytes(Math.ceil(length / 2));
    return bytes.toString('hex').slice(0, length);
}

app.use(async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', '*')

    console.log('baseurl: '+req.originalUrl)
    if ((req.originalUrl != '/login') && (req.originalUrl != '/signup')) {
        console.log('doing stuff')
        var foundUser = await client.db('onthegrind').collection('accounts').findOne({ cookie: req.headers.cookie })

        if (foundUser) {
            res.status(200).send(foundUser)
        } else {
            res.redirect(`${process.env.CLIENT_URL}/login`)
        }
    }
    next()
})

app.post('/signup', async (req, res) => {
    var newUser = { email: req.body.email, password: req.body.password, cookie: generateRandomId(32) }
    await client.db('onthegrind').collection('accounts').insertOne(newUser)
    res.send(newUser)
})

app.post('/login', async (req, res) => {
    var foundUser = await client.db('onthegrind').collection('accounts').findOne({ email: req.body.email, password: req.body.password })

    if (foundUser) {
        res.status(200).send(foundUser)
    } else {
        res.sendStatus(400)
    }
})

app.listen(1000, () => console.log('listening on port 1000'))