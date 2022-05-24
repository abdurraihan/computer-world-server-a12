const express = require('express')

const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config()

// middleware
app.use(cors())
app.use(express.json())


const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PAS}@cluster0.qotjw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: 'UnAuthorized access' })
    }
    
  
    const token = authHeader.split(' ')[1];
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
  
      req.decoded = decoded;
      // console.log(decoded) // bar
      next();
    });
  
  }





async function run() {


    try{
 
    await client.connect();
    const productsCollection = client.db('computer_world').collection('products');
    const userCollection = client.db('computer_world').collection('user');

 


    app.get('/products', async(req, res) =>{

      const products = await productsCollection.find().toArray()
      res.send(products);
        

    })



    // user 
    
    app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
  
        const updateDoc = {
          $set: user,
        };
  
  
        const result = await userCollection.updateOne(filter, updateDoc, options);
  
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h' })
  
        res.send({ result, token });
  
      });

    }finally{

    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Computer world is running ')
})

app.listen(port, () => {
  console.log(`computer world on port ${port}`)
})