const express = require('express');
const nocache = require('nocache');
const router = express.Router();
const bcrypt = require('bcrypt');
router.use(nocache());
const User = require('../models/users');
const {upload,adminController} = require("../controller/adminController")



// admin login
router.get("/adminLogin",adminController.adminLogin)
router.post("/submit",adminController.adminLoginPost)
router.get("/dashboard",adminController.adminDashboard)
router.get("/adminLogout",adminController.adminLogout)
//---------------------------------------------------------------------------

// admin Customer
router.get("/customer",adminController.adminCustomer)
router.get('/block/:id',adminController.UserBlock)
router.get('/unblock/:id',adminController.UserUnblock)
// --------------------------------------------------------------------------

// Admin Category
router.get("/category",adminController.adminCategory)
router.get("/addcategory",adminController.adminAddCategory)
router.post("/submitcategory",adminController.adminNewCategory)
router.get('/editcategory/:id',adminController.adminEditCategory)
router.post('/submiteditcategory/:id', adminController.adminUpdateCategory)
router.get('/list/:id',adminController.CategoryList)
router.get('/unlist/:id',adminController.CategoryUnlist)
// --------------------------------------------------------------------------

// Admin Product
router.get("/products",adminController.adminProducts)
router.get("/addproducts",adminController.adminAddProducts)
router.post("/submitproduct",upload,adminController.adminNewProducts)
router.get("/edit/:id",adminController.adminEditProduct)
router.post('/update/:id',upload,adminController.adminUpdateProduct)
router.get('/publish/:id',adminController.ProductPublish)
router.get('/unpublish/:id',adminController.ProductUnpublish)







module.exports = router;