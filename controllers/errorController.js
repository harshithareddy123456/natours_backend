const AppError = require('./../utils/apperror');
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicatesDB = (err) => {
  const message = `Duplicate value ${err.keyValue.name},please use other value!`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data as ${errors}`;
  return new AppError(message, 400);
};
const handleJSONError = (err) => {
  return new AppError('Invalid token,please login again!', 401);
};
const handleTokenError = (err) => {
  return new AppError('Your token has expired,please login again!', 401);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isoperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //programming or other unknown error
  } else {
    // 1) log error
    console.log('ERROR 💥');
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log('err', err);
  let name = err.stack;
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (name.includes('CastError')) {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) error = handleDuplicatesDB(error);
    if (name.includes('ValidationError')) {
      error = handleValidationError(error);
    }
    if (name.includes('JsonWebTokenError')) {
      error = handleJSONError(error);
    }
    if (name.includes('TokenExpiredError')) {
      error = handleTokenError(error);
    }
    sendErrorProd(error, res);
  }
};
