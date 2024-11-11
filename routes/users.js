require('dotenv').config();
const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

// Replace with your MongoDB Atlas connection string
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas', err);
  });

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  profileImage: String,
  contact: Number,
  boards: {
    type: Array,
    default: []
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }]
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
