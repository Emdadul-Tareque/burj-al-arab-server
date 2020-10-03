const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require("firebase-admin");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();



const port = 4000;


const app = express();
app.use(cors());
app.use(bodyParser.json());



var serviceAccount = require("./configs/burj-al-arab-firebasee-firebase-adminsdk-33t5r-c48a68f145.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB,
});




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iuz7l.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookings = client.db("burjAlArab").collection("bookings");

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
    console.log(newBooking);
  })

  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1];
      console.log({idToken});
      admin
        .auth()
        .verifyIdToken(idToken)
        .then(function (decodedToken) {
          let tokenEmail = decodedToken.email;
          if(tokenEmail == req.query.email){
            bookings
              .find({ email: req.query.email })
              .toArray((err, documents) => {
                res.send(documents);
              });
          }

          else{
            res.status(401).send("unauthorized access");
          }
        })
        .catch(function (error) {

          res.status(401).send("unauthorized access");

        });
    }
    else{
      res.status(401).send('unauthorized access')
    }

  })
});


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});  
