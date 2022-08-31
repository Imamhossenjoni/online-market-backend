const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n3hg2f8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//JWT FUNCTION
function varifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        await client.connect();
        const mobileCollection = client.db('onlineMarket').collection('mobiles');
        const reviewCollection = client.db('onlineMarket').collection('reviews');

        //get all mobile from collection
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = mobileCollection.find(query);
            const mobiles = await cursor.toArray();
            res.send(mobiles);
        })
        //single data load from collection
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const mobile = await mobileCollection.findOne(query);
            res.send(mobile);
        })

        //update the services
        app.put('/services/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            console.log(updatedQuantity);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedValue = {
                $set: {
                    quantity: updatedQuantity.quantity
                }
            };
            console.log(updatedValue);
            const result = await mobileCollection.updateOne(filter, updatedValue, options);
            res.send(result);

        })

        //update after delivered
        app.put('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const latestQuantity = req.body;
            console.log(latestQuantity)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const latestValue = {
                $set: {
                    quantity: afterQuantity.quantity
                }
            };
            console.log(latestValue);
            const result = await mobileCollection.updateOne(filter, latestValue, options);
            res.send(result)
        })

        //delete services
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await mobileCollection.deleteOne(query);
            res.send(result);
        })
        //post services
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await mobileCollection.insertOne(service);
            res.send(result);
        })
        //delete services
        // app.delete('/services/:id',async(req,res)=>{
        //     const id=req.params.id;
        //     const query={_id:ObjectId(id)};
        //     const result=await mobileCollection.deleteOne(query);
        //     res.send(result);
        // })
        //
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log(review);
            const reviews = await reviewCollection.insertOne(review);
            res.send(reviews);
        })
        app.get('/reviews', async (req, res) => {
            const query = {};
            const review = reviewCollection.find(query);
            const reviews = await review.toArray();
            res.send(reviews);
        })
    }
    finally {

    }

}
//call the function
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Runnig this server')
})
app.listen(port, () => {
    console.log('Listening th port')
})