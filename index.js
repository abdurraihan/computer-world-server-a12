const express = require('express')

const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const cors = require('cors');


require('dotenv').config()

// middleware
app.use(cors())
app.use(express.json())


const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PAS}@cluster0.qotjw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {


    try{
 
    await client.connect();
    const productsCollection = client.db('computer_world').collection('products');

 


    app.get('/products', async(req, res) =>{

      const products = await productsCollection.find().toArray()
      res.send(products);
        

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