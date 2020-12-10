var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

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
});

module.exports = router;
