const express = require('express');
const router = express.Router();
const {
  getallusers,
  adduser,
  getuser,
  updateuser,
  deleteuser,
  updateme,
  deleteme,
  getme,
} = require('../controllers/userController');
const {
  Signup,
  login,
  forgotPassword,
  resetPassword,
  updatepassword,
  protect,
  restrictTo,
} = require('../controllers/authController');

router.post('/signup', Signup);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);
//router.use(protect)
router.patch('/updatepassword', protect, updatepassword);
router.patch('/updateme', protect, updateme);
router.delete('/deleteme', protect, deleteme);
router.route('/me').get(protect, getme, getuser);

router.use(restrictTo('admin'));
router.route('/').get(protect, getallusers).post(protect, adduser);
router
  .route('/:id')
  .get(protect, getuser)
  .patch(protect, updateuser)
  .delete(protect, deleteuser);

module.exports = router;
