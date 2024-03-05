const express = require('express');
const nocache = require('nocache');
const router = express.Router();
router.use(nocache());
const userController = require("../controller/userController");
const passport = require('passport');
const authController = require("../middleware/passportSetup")

// User Login, SignUp, OTP, Resen OTP, LogOut 
router.get("/",userController.userHomePage); 
router.get("/userLogin",userController.userLoginPage);
router.post('/userLoginPost',userController.userLoginPost);
router.get("/userSginup",userController.userSignup);
router.post("/signup",userController.userSignupLogin);
router.post('/optvarification', userController.userOptPost);
router.get("/resendOpt",userController.resendOpt);
router.get('/userLogout',userController.userLogout);
// -----------------------------------------------------------------------------

// forgot Password
router.get("/forgotPassword",userController.forgotPassword);
router.post("/resetpassword",userController.postResetPassword);
// ------------------------------------------------------------------------------

// Google login
router.get("/auth/google",authController.googleAuth);
router.get("/google/callback",authController.googleAuthCallback);
// ------------------------------------------------------------------------------

// Shop, View Details
router.get("/shop",userController.userShop);
router.get("/viewDetails/:id",userController.viewDetails);
// ------------------------------------------------------------------------------

// User Profile
router.get("/usersProfileHome",userController.usersProfileHome);
router.post("/updateUserDetails",userController.updateUserDetails);
router.post("/changePassword/:id",userController.changePassword); //Change Passwords

// Order
router.get("/ordersProfile",userController.ordersProfile);

// My Address
router.get("/myAddress",userController.myAddress)
router.get("/addAddress",userController.addAddress)
router.post("/addressSubmit",userController.addressPost)
router.get("/editAddress/:id",userController.editAddress)
router.post("/updateAddressPost/:id",userController.updateAddressPost)
router.get("/deleteAddress/:id",userController.deleteAddress)
// Cart

router.get("/shopCart",userController.shopCart)
router.get("/addTocart/:id",userController.addTocart)

// checkOut
router.get("/checkOut",userController.checkOut)
router.post('/updateQuantity/:id/:action',userController.updateQuantity)
router.get("/deleteCartProduct/:id",userController.deleteCartProduct)
router.post("/order",userController.orderPost)


module.exports = router;