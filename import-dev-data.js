const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Tour = require('./models/tourmodel');
const User = require('./models/usermodel');
const Review = require('./models/reviewmodel');

const DB_URL = process.env.MONGO_URI;
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('db connected succesfully'));

//read json file

const tours = JSON.parse(
  fs.readFileSync(`./dev-data/data/tours.json`, 'utf-8'),
);
const users = JSON.parse(
  fs.readFileSync(`./dev-data/data/users.json`, 'utf-8'),
);
const reviews = JSON.parse(
  fs.readFileSync(`./dev-data/data/reviews.json`, 'utf-8'),
);

//import data into DB
const importData = async () => {
  try {
    //await Tour.create(tours);
    //await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//delete all data from collection
const deletedata = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  deletedata();
}
console.log(process.argv);

//to load or delete use command "node filename --import or node filename --delete "
