const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/usermodel');
const { deleteOne, updateOne } = require('./handlersfactory');

const filterObj = (obj, ...allowedfeilds) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedfeilds.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
const getme = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
const getallusers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});
const updateme = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This is not for password update,please use /updatepassword',
        400,
      ),
    );
  }
  //update user document
  const filteredbody = filterObj(req.body, 'name', 'email');
  const updateduser = await User.findByIdAndUpdate(req.user.id, filteredbody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateduser,
    },
  });
});

const deleteme = deleteOne(User);
const adduser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'this route is not yet defined,please use signup/login',
  });
};
const getuser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
const updateuser = updateOne(User);
const deleteuser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'user successfully deleted',
    data: {
      user,
    },
  });
});

module.exports = {
  getallusers,
  adduser,
  getuser,
  updateuser,
  deleteuser,
  updateme,
  deleteme,
  getme,
};
