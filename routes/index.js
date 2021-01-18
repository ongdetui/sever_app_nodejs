var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var admin = require("firebase-admin");
const firebase = require('firebase');
// var serviceAccount = require('../abcd.json');
var serviceAccount = require('../firebaseSDK.json');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('928709507478-fnb2gbgq5j5a8mf1qgc8545aogr9qtri.apps.googleusercontent.com');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://notereact0711.firebaseio.com'
});


var firebaseConfig = {
  apiKey: "AIzaSyBzS4O1-rBTs6lFc_vDFK1Gpx6ABtSfMXw",
  authDomain: "notereact0711.firebaseapp.com",
  databaseURL: "https://notereact0711.firebaseio.com",
  projectId: "notereact0711",
  storageBucket: "notereact0711.appspot.com",
  messagingSenderId: "928709507478",
  appId: "1:928709507478:web:5ed978d0b68cb1d9ab05b7",
  measurementId: "G-TC4022V1T1"
};

firebase.initializeApp(firebaseConfig);

// const url = 'mongodb+srv://ct030215:anhduckaka2000@cluster0.yt9gg.mongodb.net/app3?retryWrites=true&w=majority';
const url = 'mongodb://localhost:27017';
const dbName = 'milktea';


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/product', function(req, res, next) {
  console.log("cccc")
  const findDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('trasua');
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs)
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    findDocuments(db, function(docs) {
      res.json(docs);
      client.close();
    });
  });
});

// view product
router.post('/product', function(req, res, next) {
  console.log(req.body.collection);
  const findDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection(req.body.collection);
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs)
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    findDocuments(db, function(docs) {
      res.json(docs);
      client.close();
    });
  });
});  //end

//Register +++++++++++++++++++++++
router.post('/register', (req, res, next) => {
  const {email, phoneNumber, password} = req.body;
  const user = {
    email: email,
    password: password
  };
  //create account firebase if error or had account then send false
  admin.auth().createUser(user).then((user)=> {
    console.log(user.uid);
    return next();
  }).catch((error)=> {
    res.send(false);
  })
  
}, (req, res, next) => {
  const {email, phoneNumber, password} = req.body;
  firebase.auth().signInWithEmailAndPassword(email, password).then((user)=> {
    req.user = user.user;
    // console.log(user.user);
    return next();
  }).catch((error)=> {
    res.send(false);
  })
},(req, res, next) => {
  const {email, phoneNumber, password} = req.body;
  const {user} = req;
  console.log(phoneNumber)
  console.log(email)
  const dataUsers = {
    email: email,
    phoneNumber: phoneNumber,
    password: password,
    picture: null
  }
  const insertDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('nguoidung');
    // Insert some documents
    collection.insert(dataUsers, function(err, result) {
      assert.equal(err, null);
      console.log(result)
      console.log(err)
      console.log("Thêm dữ liệu thành công");
      callback(result);
    });
  }

  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    insertDocuments(db, function() {
      const {password, ...dataUser} = dataUsers;
      res.send({dataUser, user});
      client.close();
    });
  });
}); //end register


// login +++++++++++++++
router.post('/login', (req, res, next) => {
  const {userName, passWord} = req.body;
  console.log(passWord);
  firebase.auth().signInWithEmailAndPassword(userName, passWord).then((user)=> {
    req.user = user.user;
    return next();
  }).catch((error)=> {
    console.log(error);
    res.send(false);
  });
},
(req, res, next) => {
  const {user} = req;
  const {userName, passWord} = req.body;
  const findDocuments = function(db, callback) {
    const collection = db.collection('nguoidung');
    collection.find({email: userName}).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      // console.log(docs);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    findDocuments(db, function(dataUsers) {
      if(dataUsers.length !== 0){
        const dataUser = dataUsers[0];
        if(dataUser.password === passWord){
          const {password, ...rest} = dataUser;
          console.log(rest)
          res.send({user, rest});
        }
      }
      else res.send(false);
      client.close();
    });
  });
});  //end login


//login google
router.post('/login_google', (req, res, next) => {
  const accessTokenFromHeader = req.body.idToken;
  console.log(accessTokenFromHeader);
	if (!accessTokenFromHeader) {
		return res.status(401).send('Không tìm thấy access token!');
  }
  client.verifyIdToken({
    idToken: accessTokenFromHeader,
  }).then((ticket)=>{
    // console.log(ticket.getPayload());
    req.payLoad = ticket.getPayload();
    return next();
  }).catch((error)=> {
    res.send(false);
  })

}, (req, res, next)=> {
  const {payLoad} = req;
  const findDocuments = function(db, callback) {
    const collection = db.collection('nguoidung');
    collection.find({email: payLoad.email}).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      // console.log(docs);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    findDocuments(db, function(dataUsers) {
      if(dataUsers.length !== 0){
        res.send(dataUsers[0]);
      }
      else {
        return next();
      }
      client.close();
    });
  });
}, (req, res, next)=> {
  const {payLoad} = req;
  console.log(payLoad);
  const dataUsers = {
    email: payLoad.email,
    phoneNumber: '0855032080',
    name: payLoad.name,
    picture: payLoad.picture
  }
  const insertDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('nguoidung');
    // Insert some documents
    collection.insert(dataUsers, function(err, result) {
      assert.equal(err, null);
      console.log("Thêm dữ liệu thành công");
      callback(result);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    insertDocuments(db, function() {
      res.send(dataUsers);
      client.close();
    });
  });
}) //end login google

const authention = (token) => {
  return admin.auth().verifyIdToken(token);
}

//authentication
router.post("/authentoken", (req, res, next) => {
  // const accessTokenFromHeader = req.header('Authorization').replace('Bearer ', '')
  const accessTokenFromHeader = req.body.idToken;
  // console.log(accessTokenFromHeader);
	if (!accessTokenFromHeader) {
		return res.status(401).send('Không tìm thấy access token!');
  }
  admin.auth().verifyIdToken(accessTokenFromHeader).then((decodedToken) => {
    console.log(decodedToken);
    req.email = decodedToken.email;
    return next();
  })
  .catch((error)=> {
    client.verifyIdToken({
      idToken: accessTokenFromHeader,
    }).then((ticket)=>{
      // console.log(ticket.getPayload());
      req.email = ticket.getPayload().email;
      return next();
    }).catch((error)=> {
      res.send({});
    })
  })
},(req, res, next) => {
  const {email} = req;
  const findDocuments = function(db, callback) {
    const collection = db.collection('nguoidung');
    collection.find({email: email}).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    findDocuments(db, function(dataUsers) {
      const dataUser = dataUsers[0];
      const {password, ...rest} = dataUser;
      console.log(rest);
      res.send(rest);
      client.close();
    });
  });
}) //end authen

//reset token
router.post('/reset_token',(req, res, next) =>{
  // const accessTokenFromHeader = req.header('Authorization').replace('Bearer ', '');
  const accessTokenFromHeader = req.body.idToken;
  if(!accessTokenFromHeader){
    res.status(401).send("không tìm thấy token");
  }

  firebase.auth().currentUser.getIdToken(true) // here we force a refresh
  .then(function(token) {
    console.log(token)
    res.send(token);
  }).catch(function(error) {
    console.log('chưa có phiên đăng nhập trước đó');
    res.send(false);
  });
}); //end

//log out user
router.post('/logout',(req, res, next)=> {
  firebase.auth().signOut().then(()=>{
    res.send(true);
  }).catch(()=> {
    res.send(false);
  })
}) //end

//Update address user
router.post('/update_address', (req, res, next) => {
  // const accessTokenFromHeader = req.header('Authorization').replace('Bearer ', '')
  const accessTokenFromHeader = req.body.idToken;
  console.log(accessTokenFromHeader);
	if (!accessTokenFromHeader) {
		return res.status(401).send('Không tìm thấy access token!');
  }
  // console.log(accessTokenFromHeader)
  admin.auth().verifyIdToken(accessTokenFromHeader).then((decodedToken) => {
    console.log(decodedToken.email);
    req.email = decodedToken.email;
    return next();
  })
  .catch((error)=> {
    client.verifyIdToken({
      idToken: accessTokenFromHeader,
    }).then((ticket)=>{
      // console.log(ticket.getPayload());
      req.email = ticket.getPayload().email;
      return next();
    }).catch((error)=> {
      res.send(false);
    })
  })
}, (req, res, next) => {
  console.log(req.email);
  const {email} = req;
  const diachi = req.body.address;
  // console.log(diachi)
  const updateDocument = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('nguoidung');
    // Update document where a is 2, set b equal to 1
    collection.updateOne({ email : email }
      , { $set: diachi }, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Updated the document with the field a equal to 2");
      callback(result);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    updateDocument(db, function(data) {
      // console.log(data);
      res.send(true);
      client.close();
    });
  });
}) //end


//user buy product
router.post('/order_product', (req, res, next) => {
  // const accessTokenFromHeader = req.header('Authorization').replace('Bearer ', '')
  const accessTokenFromHeader = req.body.idToken;
  console.log(accessTokenFromHeader);
	if (!accessTokenFromHeader) {
		return res.status(401).send('Không tìm thấy access token!');
  }
  // console.log(accessTokenFromHeader)
  admin.auth().verifyIdToken(accessTokenFromHeader).then((decodedToken) => {
    console.log(decodedToken.email);
    req.email = decodedToken.email;
    return next();
  })
  .catch((error)=> {
    client.verifyIdToken({
      idToken: accessTokenFromHeader,
    }).then((ticket)=>{
      // console.log(ticket.getPayload());
      req.email = ticket.getPayload().email;
      return next();
    }).catch((error)=> {
      res.send(false);
    })
  })
}, (req, res, next) => {
  console.log(req.email);
  const {email} = req;
  const sanPhamMua = req.body.listCart;
  const updateDocument = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('nguoidung');
    // Update document where a is 2, set b equal to 1
    collection.updateOne({ email : email }
      , { $set: {sanPhamMua} }, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Updated the document with the field a equal to 2");
      callback(result);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    updateDocument(db, function(data) {
      // console.log(data);
      res.send(true);
      client.close();
    });
  });
})

//delete account
router.post('/delete_user', (req, res, next) => {
  const accessTokenFromHeader = req.body.idToken;
  // console.log(accessTokenFromHeader);
	if (!accessTokenFromHeader) {
		return res.status(401).send('Không tìm thấy access token!');
  }
  // console.log(accessTokenFromHeader)
  admin.auth().verifyIdToken(accessTokenFromHeader).then((decodedToken) => {
    console.log(decodedToken.email);
    req.email = decodedToken.email;
    return next();
  })
  .catch((error) => {
    res.send(false);
  })
}, (req, res, next) => {
  const email = req.email;
  console.log(email);
  const removeDocument = function(db, callback) {
    const collection = db.collection('nguoidung');
    // Delete document where a is 3
    collection.deleteOne({ 'email' : email }, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Removed the document with the field a equal to 3");
      callback(result);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    removeDocument(db, function() {
      res.send(true);
      client.close();
    });
  });
}) //end


module.exports = router;
