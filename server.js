const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB_URL = process.env.MONGO_URI;
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('db connected succesfully'));
const port = process.env.PORT || 6000;

const server = app.listen(port, () => console.log('listening on port 6000'));

process.on('unhandledRejection', (err) => {
  console.log(err.name, err, message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('unknown error,shutting down');
  server.close(() => {
    process.exit(1);
  });
});
// console.log(x);
