const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const jwt = require('jsonwebtoken')
const cokieParser = require('cookie-parser')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;


// midleware
app.use(cors(
 {origin: ['http://localhost:5173'],
  credentials: true,
 }
));
app.use(express.json());
app.use(cokieParser());

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if(!token){
    return res.status(401).send({message: 'unautorize access'})
  }
  jwt.verify(token, process.env.JWT_Token, (err, decoded) => {
    if(err){
         return res.status(401).send({message: 'unautorize access'})
    }
    req.user = decoded;
    next();
  }) 

}



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
// get apis my jobs
    app.get("/jobs", async(req, res) => {
      const email = req.query.email;
      let query = {};
      if(email){
        query = {hr_email: email}
      }
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });
// authentication apis with token
app.post('/jwt', (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_Token, {expiresIn: '1d'});
  res.cookie('token', token, {
      httpOnly: true,
      secure: false, // set to true if using HTTPS

    })
  .send({success: true})

})

    app.post("/jobs", async(req, res) => {
      const data = req.body;
      
      const result = await jobCollection.insertOne(data);
      res.send(result);
    })

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
    app.get("/job-application", verifyToken, async (req, res) => {
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
