const express = require('express')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const orderCollection = client.db('computer_world').collection('order');
    const reviewCollection = client.db('computer_world').collection('review');

 



    //post review 
    app.post('/review', verifyJWT, async(req,res)=>{
      const review = req.body;
     //console.log(review)
      const result = await reviewCollection.insertOne(review);
      res.send(result);
  })

  //get review

    app.get('/review', async(req,res)=>{
    
      const query = {}
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
  })



    // post products

    app.post('/products', verifyJWT, async(req,res)=>{
       const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);

    })


//get all products
    app.get('/products',  async(req, res) =>{

      const products = await productsCollection.find().toArray()
      res.send(products);
        

    })

    //delete products 
    app.delete('/products/:id',verifyJWT,  async(req, res) => {
      const id = req.params;
    //  console.log(id);
      const query =  {_id: ObjectId(id)}  ;
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    
    })

    // get products by id

    app.get('/products/:id', async(req , res) =>{
            const _id = (req.params)
            //console.log(_id);
            const query =  {_id: ObjectId(_id)}  ;
            const result = await productsCollection.find(query).toArray();
            res.send(result);
    })


    //post order
    app.post('/order' , async(req,res)=>{
        const order = req.body;
        
        //console.log(order);
        const result = await orderCollection.insertOne(order);
        res.send(result);
    })





    //get Order by email for single user 
    app.get('/order/:email', verifyJWT, async(req , res) =>{
         const query = req.params;
         const result = await orderCollection.find(query).toArray();
         res.send(result);

    })

    //get all orders for admin
    app.get('/order', verifyJWT, async(req, res)=>{
      const query = {};
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    })

    // delete order by id 
    app.delete('/order/:id',verifyJWT,  async(req, res) => {
      const id = req.params;
     // console.log(id);
      const query =  {_id: ObjectId(id)}  ;
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    
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

      //put user for my profile link

      
    app.put('/profile/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };

      const updateDoc = {
        $set: user,
      };


      const result = await userCollection.updateOne(filter, updateDoc, options);

     

      res.send( result);

    });

      // get all user 
      app.get('/users',  async (req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
      })

      //create  admin 
    app.put('/user/admin/:email',   async (req, res) => {
      const email = req.params.email;
      //console.log(email)
      const filter = { email: email };
      const updateDoc = {
        $set: { role: 'admin' },
      };

      const result = await userCollection.updateOne(filter, updateDoc);

      res.send(result);

    });


    
    //for admin rout private 

    app.get('/admin/:email', async(req , res) =>{
      const email = req.params.email;
      const user = await userCollection.findOne({email:email});

      const isAdmin = user.role == 'admin';
      res.send({admin: isAdmin})
    })


    

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