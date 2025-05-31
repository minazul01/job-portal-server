const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;


// midleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eyk5ydv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const jobCollection = client.db("job-portal").collection("jobs");
    const jobApplicationCollection = client.db("job-portal").collection("jobs_Appliction");

// data convert
    app.get("/jobs", async(req, res) => {
      const result = await jobCollection.find().toArray();
      res.send(result);
    });

    // id daynamic
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const quire = {_id: new ObjectId(id)};
      const result = await jobCollection.findOne(quire);
      res.send(result);
    })

    // job application post 
    app.post("/job-application", async (req, res) => {
      const data = req.body;
      const result = await jobApplicationCollection.insertOne(data);
      res.send(result);
    })

    // job application get data 
    app.get("/job-application", async (req, res) => {
      const quire = req.query.email;
      const data = {user_email: quire}
      const result = await jobApplicationCollection.find(data).toArray();
      // fokira way to access my application it match data
      // for(const myAppli of result){
      //   const quire1 = {_id: new ObjectId(myAppli.job_id)};
      //   const job = await jobApplicationCollection.findOne(quire1);
      //   if(job){
      //     // myAppli.title = job.title;
      //     job.title = myAppli.title;
      //     myAppli.company = job.company;
      //     myAppli.company_logo = job.company_logo;
      //   }
      // }
      res.send(result);
    })

    // Delete 
    app.delete("/job-application/:id", async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobApplicationCollection.deleteOne(query);
      res.send(result);
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
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
