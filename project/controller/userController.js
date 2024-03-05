const bcrypt = require('bcrypt');
const saltPassword = 10;
const User = require('../models/users');
const nodemailer = require('nodemailer');
require("dotenv").config();
const {genaratorOpt} = require("../optgenarator");
const products = require('../models/products');
const Address = require('../models/address');
const Cart = require('../models/cart')





const userController = {
// signUp Root
    userSignup:(req,res)=>{
        res.render("users/signup",)
    },

// Login Root
    userLoginPage:(req,res)=>{
        res.render("users/userLogin")
    },

    userSignupLogin: async (req,res)=>{
        const existingEmail = await User.findOne({email: req.body.email});
        const existingName = await User.findOne({name:req.body.name});
        const existingPhone = await User.findOne({phone:req.body.phone});
        if(existingEmail){
             res.render('users/signup',{title:"SignUP", alert:"Email already exists, Please try with another one",});
        }
        else if (existingPhone) {
            res.render('users/signup',{title:"SignUP", alert:"Phone Number already exists, Please try with another one",});
            
        }
        else if(existingName){
            res.render('users/signup', { title: "SignUP", alert: "Name already exists, Please try with another one" });
        }else{
            const hashedPassword = await bcrypt.hash(req.body.password, saltPassword);
            // break
            let config = {
                service : "gmail",
                auth:{
                    user:process.env.EMAIL,
                    pass:process.env.PASSWORD,
                }
            }
            let transporter = nodemailer.createTransport(config)
            let otp = genaratorOpt();

            const info=  await transporter.sendMail({
                from:process.env.EMAIL,
                to:req.body.email,
                subject:"OTP varification",
                html:`<b> Your OTP is ${otp}<b>`,
            })
            const user = new User({
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone,
                password : hashedPassword,
                OTP:otp,
            });
            try{
                await user.save();
                res.render('users/optverification');
            } catch(er){
                
               res.json({message:er.message, type:"danger"}); 
            }
        }
    
    },

    userLoginPost:async (req,res)=>{
        try{
            const data = await User.findOne({email: req.body.email})

            if(data){
                if(data.isblocked){
                    const passwordMatch = await bcrypt.compare(req.body.password,data.password);
                    if(passwordMatch){
                        req.session.user = req.body.email;
                        req.session.userID= data._id;
                        
    
                        res.redirect('/')
                    }else{
                        res.render('users/userLogin',{title:"Login",alert:"Entered Email or password is incorrect",});
                    }
                }else{
                res.render('users/signup',{title:"Signup",alert:"Your account has been blocked",});

                }
            }else{
                res.render('users/signup',{title:"Signup",alert:"Account Doesn't Exist, Please signup",});
            }
        }catch (error){
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
    userHomePage:async (req,res)=>{
        const prod = await products.find({ispublished:true})
        .populate({
            path:"category",
            match:{islisted:true}
        })
        res.render('users/Homepage',{prod:prod,user:req.session.user})
    },

    userOptPost:async(req,res)=>{
      const OTP = await User.findOne({OTP:req.body.otp});
      if(OTP){
        res.render("users/userLogin")
      }else{
        res.render('users/optverification')
      }
    },
    resendOpt :async (req, res) => {
        try {
            const user = await User.findOne({ user: req.body.email });
            if (!user) {
                return res.json({ message: "User not found", type: "danger" });
            }
    
            const newotp = genaratorOpt();
    
            let config = {
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                }
            };
            let transporter = nodemailer.createTransport(config);
    
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: user.email,
                subject: "OTP verification",
                html: `<b> Your OTP is ${newotp}<b>`,
            });
    
            
            await User.findOneAndUpdate( { OTP: newotp });
           
        } catch (err) {
            res.json({ message: err.message, type: "danger" });
        }
    },
    userShop: async (req,res)=>{
        const prod = await products.find({ispublished:true});
        res.render("users/shop",{prod:prod,user:req.session.user})
    },

    viewDetails:async (req,res)=>{
        try{
            const id = req.params.id;
            const prod = await products.findById(id).populate("category")
            const prods = await products.find({ispublished:true})
            .populate({
                path:"category",
                match:{islisted:true},
            })
            if(!prod){
                res.redirect('/shop');
                return;
            }
            res.render('users/viewDetails',{prod:prod,prods:prods,user:req.session.user});
        }catch(err){
            console.error(err);
            res.redirect('/shop')
        }

    },
    userLogout:(req,res)=>{
        req.session.user = null;
        res.redirect('/')
    },

    forgotPassword:(req,res)=>{
        res.render('users/forgotPassword')
    },
    postResetPassword : async (req, res) => {
        const postEmail = req.body.email;
        const newPassword = req.body.password;
    
        try {
            // Find user by email
            const user = await User.findOne({ email: postEmail });
            if (!user) {
                return res.redirect('/forgotpassword');
            }
    
            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, saltPassword);
    
            // Update user's password
            user.password = hashedPassword;
            await user.save();
    
            // Redirect user to login page after successful password reset
            return res.redirect('/userLogin');
        } catch (error) {
            // Handle errors
            return res.status(500).json({ message: error.message, type: "danger" });
        }
    },
    usersProfileHome: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user) {
                return res.render("users/userLogin", { user: req.session.user, alert: "Please login" });
            }
    
            const foundUser = await User.findOne({ email: req.session.user });
            if (!foundUser) {
                return res.render("users/userLogin", { user: req.session.user, alert: "User not found" });
            }
    
            res.render("users/usersProfileHome", { user: req.session.user, users: foundUser });
        } catch (err) {
            console.error(err);
            res.json({ message: err.message, type: "danger" });
        }
    },
    
    
    addAddress:async(req,res)=>{
        const userId = req.session.userID
        // const data = await Address.findById({ userId:userId  });
        res.render("users/addAddress",{ user:req.session.user})
    },
    myAddress: async (req, res) => {
        try {
            const userId = req.session.userID;
            const address = await Address.findOne({ userId: userId });
    
            if (address) {
                // Address found, render the view with the address details
                res.render("users/myAddress", { user: req.session.user, address: [address] });
            } else {
                // No address found, render the view with a message indicating no address
                res.render("users/myAddress", { user: req.session.user, address: null });
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            // Handle the error appropriately, maybe render an error page or send an error response
            res.status(500).send("Internal Server Error");
        }
    },
    
    ordersProfile: (req,res)=>{
        res.render("users/ordersProfile",{user:req.session.user})
    },
    addressPost: async (req, res) => {
        try {
            const userId = req.session.userID;
            const newAddress = { ...req.body };
            
            let userAddress = await Address.findOne({ userId: userId });
    
            if (!userAddress) {
                userAddress = new Address({ userId: userId, addressDetails: [] });
            }
    
            userAddress.addressDetails.push(newAddress);
            await userAddress.save();
    
            req.session.message = {
                type: "success",
                message: "Address Added Successfully!",
            };
            res.redirect("/myAddress");
        } catch (error) {
            console.error("Error adding Address:", error);
            res.status(500).json({ message: "Server Error" });
        }
    },
    
    // addressPost: async (req,res)=>{
    //     const userId = req.session.userID
    //     const address = new Address({
    //         // email:req.session.user,
    //         address: req.body.address,
    //         street: req.body.street,
    //         city:req.body.city,
    //         state:req.body.state,
    //         zip:req.body.zip,
    //         country:req.body.country,
    //     })
    //     try{
    //         await address.save();
    //         res.redirect('/myAddress')
    //     }catch(err){
    //         console.error(err);
    //         res.json({message : err.message , type :"danger" })
    //     }


    // },
    updateUserDetails: async(req,res)=>{
        const email = req.body.email;
        try{
            const result = await User.findOneAndUpdate({email:email},{
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone,
            });
            res.redirect('/usersProfileHome')
        }catch(err){
            console.error(err);
            res.json({message : err.message , type :"danger" })
        }
    },
    editAddress: async (req, res) => {
        try {
            const id = req.params.id;
            const addressDocument = await Address.findOne({ 'addressDetails._id': id });
            
            if (!addressDocument) {
                res.redirect('/myAddress');
                return;
            }
            
            const address = addressDocument.addressDetails.find(address => address._id.toString() === id);
            
            res.render("users/editAddress", { user: req.session.user, address: address });
        } catch (err) {
            console.error(err);
            res.json({ message: err.message, type: "danger" });
        }
    },
    
        
    updateAddressPost: async (req, res) => {
        const id = req.params.id;
        try {
            const addressDocument = await Address.findOne({ 'addressDetails._id': id });
            
            if (!addressDocument) {
                res.redirect('/myAddress');
                return;
            }
            
            // Find the index of the address to update in the addressDetails array
            const addressIndex = addressDocument.addressDetails.findIndex(address => address._id.toString() === id);
            
            // Update the address details at the found index
            addressDocument.addressDetails[addressIndex].address = req.body.address;
            addressDocument.addressDetails[addressIndex].street = req.body.street;
            addressDocument.addressDetails[addressIndex].city = req.body.city;
            addressDocument.addressDetails[addressIndex].state = req.body.state;
            addressDocument.addressDetails[addressIndex].zip = req.body.zip;
            addressDocument.addressDetails[addressIndex].country = req.body.country;
    
            // Save the updated document
            await addressDocument.save();
    
            res.redirect('/myAddress');
        } catch (err) {
            console.error(err);
            res.json({ message: err.message, type: "danger" });
        }
    },
    
    deleteAddress: async(req,res)=>{
        const id = req.params.id;

        try{
            // Find the document containing the address details
              const addressDocument = await Address.findOne({ 'addressDetails._id': id });

             if (!addressDocument) {
             res.redirect('/myAddress');
               return;
              }

          // Use $pull to remove the matching address from the addressDetails array
             await Address.updateOne(
               { _id: addressDocument._id },
               { $pull: { addressDetails: { _id: id } } }
           );

          // After deleting the address, you might want to redirect the user to a different page
                  res.redirect('/myAddress');

        }catch(err){
            console.error(err);
        res.json({message : err.message});
        }
        
    },
    changePassword: async (req, res) => {
        const id = req.params.id;

        const newPassword = req.body.newPassword;
    
        try {
            // Find user by id
            const data = await User.findById(id)
            if (data) {
                const passwordMatch = await bcrypt.compare(req.body.currentPassword,data.password);
                if(passwordMatch){
                    const hashedPassword = await bcrypt.hash(newPassword, saltPassword)
                    data.password = hashedPassword;
                    await data.save();
                    req.session.message = {
                        type: "success",
                        message : "Your password is changed  successfully",
                    };
                    return res.redirect('/usersProfileHome')

                }
                req.session.message = {
                    type: "danger",
                    message : "Your password is incorrect",
                };
                return res.redirect('/usersProfileHome')
            }
        } catch (error) {
            // Handle errors
            return res.status(500).json({ message: error.message, type: "danger" });
        }
    },
    shopCart: async (req, res) => {
       
            const userId = req.session.userID;
            const userCart = await Cart.find({ userId:userId }).populate({
                path: "items.product",
                message: "product"
            });
    
            res.render("users/shopCart", { cart: userCart, user: req.session.user });
    
       
    },
    addTocart:async(req,res)=>{
        try{
            const userId= req.session.userID;
            const productId = req.params.id;
            const quantity = 1;
            const product = await products.findById(productId);
            if(!product){
                return res.status(404).json({message:"product not found"})
            }
            let userCart = await Cart.findOne({userId});
            if(!userCart){
                const newCart = new Cart({
                    userId,
                    items:[{
                        product:productId,
                        price:product.price,
                        quantity:quantity,
                    }],
                    totalPrice :product.price * quantity
                });
                userCart = await newCart.save();
            }else{
                const existingItem = userCart.items.find(item=>item.product.toString()===productId.toString());
                if(existingItem){
                    existingItem.quantity += quantity;
                }else{
                    userCart.items.push({product:productId,price:product.price,quantity:quantity});

                }
                userCart.totalPrice = userCart.items.reduce((total,item)=>total+(item.price* item.quantity),0)
                await userCart.save();
            }
            res.redirect('/')
        }catch(err){
            console.error("Error adding item to cart :",err);
            res.status(500).json({message:"internal Sever Error"})
        }
    },

    checkOut: async(req,res)=>{
        const userId = req.session.userID
        const emailId = req.session.email
        const data = await User.findOne({emailId})
        const address = await Address.findOne({ userId: userId });
        const userCart = await Cart.find({userId:userId}).populate({
            path:"items.product",
            message:"product"
        })
        res.render("users/checkOut",{data:data, cart:userCart,user:req.session.user,address: [address]})
    },

    // defaultAddress:async(req,res)=>{
    //     const userId =req.session.userID
    //     const addressId = req.body.addressId
    //     try {
    //         const userAddress = await Address.findOne({ userId });
    
    //         if (!userAddress) {
    //             console.log("User Details not found");
    //             return res.status(404).json({ success: false, message: "User Details not found" });
    //         }
    
    //         userAddress.addressDetails.forEach(address => {
    //             address.isDefault = userAddress._id.toString() === addressId;
    //         });
    
    //         await userAddress.save();
    
    //         res.json({
    //             success: true,
    //             message: "Default Address Updated successfully",
    //         });
    //     } catch (error) {
    //         console.error("Error updating default address:", error);
    //         res.status(500).json({ success: false, error: 'Internal server error' });
    //     }
    // },
    updateQuantity: async (req, res) => {
        try {
            const userId = req.session.userID;
            const productId = req.params.id;
            const action = req.params.action; // "increment" or "decrement"
            console.log(productId);
            console.log(action);
            
    
            // Fetch userCart and update quantity based on action
            let userCart = await Cart.findOne({ userId: userId });
            console.log(userCart);
    
            if (userCart) {
                const productInCart = userCart.items.find(item => item.product.toString() === productId);
    
                if (productInCart) {
                    if (action === "increment") {
                        productInCart.quantity += 1;
                    
                    } else if (action === "decrement" && productInCart.quantity > 1) {
                        productInCart.quantity -= 1;
                    }
    
                    userCart.totalPrice = userCart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    
                    await userCart.save();
    
                    // Send the updated details in the response
                    res.json({
                        success: true,
                        quantity: productInCart.quantity,
                        price: productInCart.price,
                        totalPrice: userCart.totalPrice
                    });
                } else {
                    res.json({ success: false, message: 'Product not found in the cart' });
                }
            } else {
                res.json({ success: false, message: 'User cart not found' });
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    deleteCartProduct: async (req, res) => {
        const id = req.params.id;
        console.log(id);
        try {
            // Find the document containing the cart item
            const cartDocument = await Cart.findOne({ 'items._id': id });
    
            if (!cartDocument) {
                res.redirect('/shopCart');
                return;
            }
    
            // Use $pull to remove the matching item from the items array
            await Cart.updateOne(
                { _id: cartDocument._id },
                { $pull: { items: { _id: id } } }
            );
    
            // After deleting the item, redirect the user to a different page
            res.redirect('/shopCart');
    
        } catch (err) {
            console.error(err);
            res.json({ message: err.message });
        }
    },
    orderPost:async(req,res)=>{
        try{
            const userId = req.session.userID
            const {productId,totalPrice} = req.body
            
            if(!productId){
                return res.status(400).json({ error: 'Please select an address' });
                
            }
        let userOrder = await Order.findOne({ userId });


        }catch(err){

        }
    },

    
    
}

module.exports = userController;