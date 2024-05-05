const { promisify } = require('util');
const User = require('../models/usermodel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/apperror');
// const sendmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const Signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const token = signToken(newUser._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      newUser,
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 400));
  }
  //if everything is okay ,send token to client
  const token = signToken(user._id);
  if (process.env.NODE_ENV === 'production') {
    res.cookie('jwt', token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      ),
      secure: true,
      httpOnly: true,
    });
  }
  res.status(200).json({
    status: 'success',
    token,
  });
});

const protect = catchAsync(async (req, res, next) => {
  //1) getting the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in,please login to get access', 401),
    );
  }
  //2) verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  //3) Check if user exists
  const freshuser = await User.findById(decoded.id);
  if (!freshuser) {
    return next(new AppError('the user belonging to the token does not exist'));
  }
  //4) Check if user changed password after the token was issued
  if (freshuser.changedPasswordAfter(decoded.iat)) {
    console.log('chNGED');
    return next(
      new AppError('User recently changed password! please login again', 401),
    );
  }

  //grant access to protected route
  req.user = freshuser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this operation',
          403,
        ),
      );
    }
    next();
  };
};
const forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  //2)generate the random token
  const resetToken = user.createPasswordresetToken();
  await user.save({
    validateBeforeSave: false,
  });
  //3)send it to users email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL} if you dint forget password please ignore email`;
  console.log(resetURL);
  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
    resetURL: resetURL,
  });
  //   try {
  //     await sendmail({
  //       email: user.email,
  //       subject: 'Your password reset token (valid for 10 mins)',
  //       message,
  //     });
  //     res.status(200).json({
  //       status: 'success',
  //       message: 'Token sent to email',
  //     });
  //   } catch (err) {
  //     user.passwordResetToken = undefined;
  //     user.passwordResetExpires = undefined;
  //     await user.save({
  //       validateBeforeSave: false,
  //     });
  //     return next(new AppError('there was error sending an email', 500));
  //   }
});

const resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token
  const hashedtoken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedtoken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2)if token has not expired,and there is user,set the new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  //3)update changedpassword property for user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //4)log the user in ,send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

const updatepassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;
  //1)get user from collection
  const user = await User.findById(req.user._id).select('+password');
  //2)posted password is correct
  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError('Your Existing password is not correct', 403));
  }
  //3)if so update the password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  //4)log user in and send jwt
  await user.save();
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});
module.exports = {
  Signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatepassword,
};
