const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection string
const uri = "mongodb+srv://<userId>:<userPassword>@<project>.b2ldu.mongodb.net/?retryWrites=true&w=majority&appName=<project>";

// Replace <username>, <password>, <cluster-name>, and <dbname> with your details

async function uploadData() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected to MongoDB!");

    // Read the JSON file
    const jsonData = JSON.parse(fs.readFileSync('../server/resource/jsondata.json', 'utf8'));

    // Insert the JSON data into the collection
    const result = await client.db("visualization").collection("data").insertMany(jsonData);
    
    console.log(`${result.insertedCount} documents inserted!`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

uploadData().catch(console.error);
