const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;



//middle wire 
app.use(express.json())
app.use(cors())




//uri
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
        // await client.connect();

        const toyCollection = client.db("toyDB").collection("addToys");

        //All toy get
        app.get('/allToy', async (req, res) => {
            const toys = await toyCollection.find().limit(20).toArray();
            res.send(toys);
        })


        //get sub category
        app.get('/allToy/:subCategory', async (req, res) => {
            const category = req.params.subCategory;
            const result = await toyCollection.find({ subCategory: category }).toArray()
            res.send(result)
        })


        //search  by name emplement
        app.get('/searchByName/:text', async (req, res) => {
            const searchText = req.params.text;
            const result = await toyCollection.find({
                $or: [
                    { toyName: { $regex: searchText, $options: "i" } }
                ],
            })
                .toArray()
            res.send(result)
        })


        //POST ROUTE METHOD
        app.post("/post-toys", async (req, res) => {
            const body = req.body;
            body.createdAt = new Date();
            console.log(body);
            const result = await toyCollection.insertOne(body);
            if (result?.insertedId) {
                return res.status(200).send(result);
            } else {
                return res.status(404).send({
                    message: "can not insert try again leter",
                    status: false,
                });
            }
        });


        //SINGLE TOY GET
        app.get("/singleToy/:id", async (req, res) => {
            console.log(req.params.id);
            const id = req.params;
            const jobs = await toyCollection.findOne({
                _id: new ObjectId(id),
            });
            res.send(jobs);
        });



        //EMAIL MATCH
        app.get('/myToys/:email', async (req, res) => {
            const sort = req.query.price;
            const email = req.params.email;
            console.log(req.query.price);
            if (sort == 'ascending') {
                let result = await toyCollection.find({ postedBy: email }).sort({ price: 1 }).toArray();
                res.send(result)
            }
            else if (sort == 'descending') {
                let result = await toyCollection.find({ postedBy: email }).sort({ price: -1 }).toArray();
                res.send(result)
            }
            else {
                const result = await toyCollection.find({ postedBy: email }).toArray()
                res.send(result)

            }
        });


        app.get('/post-toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query);
            res.send(result)
        })


        //UPDATE TOY METHOD
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


        //DELETED METHOD
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