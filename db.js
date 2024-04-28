const mongoose = require("mongoose");
require("dotenv").config();

// Define the mongoDB connection URL
// mongoDB://localhost:27017/database

const mongoURL = process.env.MONGODB_URL_LOCAL;

// set up mongoDB connection
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Get the default connection
// Mongoose maintains a default connection object representing the mongoDB connection
const db = mongoose.connection;

// Define eventlistener for dabatbase connection

db.on("connected", () => {
    console.log("Connected to mongoDB Server");
});
db.on("disconnected", () => {
    console.log("mongoDB Server disconnected");
});
db.on("error", (err) => {
    console.log("Connection Error", err);
});

// Export the database connection
module.exports = db;
