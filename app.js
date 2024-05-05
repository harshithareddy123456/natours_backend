const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/apperror');
const globalerrorHandler = require('./controllers/errorController');

const app = express();

app.use(express.static(`${__dirname}/public`));
//middlewares
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour',
});

app.use('/api', limiter);
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

//doing sanitisation against XSS

app.use((req, res, next) => {
  console.log('first custom middleware function');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//ROUTES

app.use('/api/v1/tours', tourRouter);

// app.get('/api/v1/tours', gettours);
// app.get('/api/v1/tours/:id', gettour);
// app.post('/api/v1/tours', posttour);
// app.patch('/api/v1/tours/:id', updatetour);
// app.delete('/api/v1/tours/:id', deletetour);

//users
app.use('/api/v1/users', userRouter);

//reviews
app.use('/api/v1/reviews', reviewRouter);
// app.route('/api/v1/users').get(getallusers).post(adduser);
// app
//   .route('/api/v1/users/:id')
//   .get(getuser)
//   .patch(updateuser)
//   .delete(deleteuser);

// app.get('/', (req, res) => {
//   res.status(200).json({ messege: 'helloe from harshitha' });
// });
// app.post('/', (req, res) => {
//   res.status(200).send('you can send through this end point');
// });
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Cant find ${req.originalUrl} on this server`,
  // });
  // const err = new Error(`Cant find ${req.originalUrl} on this server`);
  // (err.status = 'fail'), (err.statusCode = 404);
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});
app.use(globalerrorHandler);
//server
module.exports = app;
