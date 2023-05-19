const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;



//middle wire 
app.use(express.json())
app.use(cors())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z9fzoxa.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const toyCollection = client.db("toyDB").collection("addToys");

        app.get('/allToy', async (req, res) => {
            const toys = await toyCollection.find().limit(20).toArray();
            res.send(toys);
        })


        // Creating index on two fields
        const indexKeys = { title: 1, category: 1 }; // Replace field1 and field2 with your actual field names
        const indexOptions = { name: "titleCategory" }; // Replace index_name with the desired index name
        const result = await toyCollection.createIndex(indexKeys, indexOptions);

       

        app.get('/post-toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query);
            res.send(result)
        })

        app.put('/post-toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedToys = req.body;
            const toys = {
                $set: {
                    userName: updatedToys.userName,
                    image: updatedToys.image,
                    postedBy: updatedToys.postedBy,
                    quantity: updatedToys.quantity,
                    description: updatedToys.description,
                    price: updatedToys.price,
                    toyName: updatedToys.toyName,
                    subCategory: updatedToys.subCategory,
                    ratings: updatedToys.ratings,
                }
            }
            const result = await toyCollection.updateOne(filter, toys, options)
            res.send(result)
        })

        app.delete('/post-toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Toy emporium Server is running')
})


app.listen(port, () => {
    console.log('Toy emporium server is running on port : ' + port);
})