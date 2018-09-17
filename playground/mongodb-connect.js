const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/Iwachat',(err, client) => {
  if (err) {
    return console.log('unable to connect to mongoDB server');
  }
  console.log('connect!!')
  const db = client.db('ChatApp');

  db.collection('ChatApp').insertOne({
    text: 'here you are'
  }, (err, result) => {
    if (err) {
      return console.log('unable to insert todo', err);
    }

  });


  client.close();
});