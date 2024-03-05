const User = require('../models/users');
const Category = require('../models/category')
const Products = require('../models/products');
const multer = require('multer');
const products = require('../models/products');
const category = require('../models/category');
 





// admin login
const credential ={
    email:"admin@gmail.com",
    password:"12345",

};

// addImage
var storage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null, "./public/products");
    },
    filename: function(req,file,callback){
        callback(null, file.fieldname + "_"+ Date.now()+ "_"+ file.originalname);
    },
});
// uploadMidleWare

var upload = multer({
    storage:storage,
}).array("images",3); 

const adminController={
    adminLogin:(req,res)=>{
        if(!req.session.admin){
        res.render("admin/login");
        }else{
            res.render('admin/dashboard')
        }
    },

    adminLoginPost:(req,res)=>{

        if(req.body.email==credential.email && req.body.password == credential.password)
        {
            req.session.admin = req.body.email
            res.redirect("/dashboard");
        }else{
            res.render("admin/login");
        }
       
    },
    adminDashboard:(req,res)=>{
        if(!req.session.admin){
            res.render("admin/login");
            }else{
                res.render('admin/dashboard')
            }
    },
    adminLogout:(req,res)=>{
        if(req.session.admin){
            req.session.admin = null;
            res.render('admin/login');
        }else{
            res.render('admin/login')
        }
    },



    adminProducts:async(req,res)=>{
        const product = await Products.find()
        res.render("admin/products",{product:product})
    },
    adminCategory:async(req,res)=>{
        const category = await Category.find()
        res.render("admin/category",{category:category})
    },
    adminCustomer:async(req,res)=>{
        const user = await User.find()
        res.render("admin/customer",{user:user})
    },
    adminAddCategory:(req,res)=>{
        res.render("admin/addcategory")
    },

    adminNewCategory: async (req,res)=>{
        const existingcategory = await Category.findOne({category: req.body.category});
        if(existingcategory){
             res.render('users/addcategory',{title:"SignUP", alert:"Email already exists, Please try with another one",});
        }else{
           
            const newcategory = new Category({
                category:req.body.category,
                description:req.body.description,
            });
            try{
                await newcategory.save();
                res.redirect('/category');
            } catch(er){
               res.json({message:er.message, type:"danger"}); 
            }
        }
    
    },
    // addProductRoot

    adminAddProducts:async (req,res)=>{
        const category = await Category.find()
        res.render('admin/addproducts',{cate:category})
    },
    // addnewproductpage

    adminNewProducts:async(req,res)=>{
        const existingproduct = await Products.findOne({product : req.body.category});
        if(existingproduct){
            res.render('users/addproducts')
        }else{
            const images = req.files.map(file=>file.filename)
            const newproduct = new Products({
                product:req.body.product,
                description:req.body.description,
                brand:req.body.brand,
                bandColor:req.body.bandColor,
                bandMeterial:req.body.bandMeterial,
                warrantyType:req.body.warrantyType,
                warrantyDescription:req.body.warrantyDescription,
                Country:req.body.Country,
                waterResi:req.body.waterResi,
                PackingDelivery:req.body.PackingDelivery,
                price : req.body.price,
                oldPrice:req.body.oldPrice,
                stock:req.body.stock,
                category:req.body.category,
                images:images,
            });
            try{
                await newproduct.save();
                res.redirect('/products')
            }catch(er){
                res.json({message:er.message,type:"danger"})
            }
        }

    },
    // editPageRoot

    adminEditProduct:async (req,res)=>{
        try{
            const id = req.params.id;
            const category = await Category.find()
            const prod = await Products.findById(id);
            if(!prod){
                res.redirect('admin/products');
                return;
            }
            res.render('admin/editproduct',{prod:prod,cate:category});
        }catch(err){
            console.error(err);
            res.redirect('admin/products')
        }

    },

    // editqueryParams

    // adminId:(req,res)=>{
    //     const prod = req.params.id
    //     res.send(`hai,${prod}`)
    // },


    // updateProduct
    adminUpdateProduct:async (req,res)=>{
        const id = req.params.id;
        try{
            const images = req.files.map(file=> file.filename);
            const result = await Products.findByIdAndUpdate(id,{
                product:req.body.product,
                description:req.body.description,
                brand:req.body.brand,
                price : req.body.price,
                category:req.body.category,
                images:images,
            });
                 
            res.redirect('/products');
        }catch(err){
            console.error(err);
            res.json({message : err.message , type :"danger" })
        }
    },
    // edit a category

    adminEditCategory:async(req,res)=>{
        try{
            const id = req.params.id;
            const categ = await Category.findById(id);
            if(!categ){
                res.redirect('admin/category');
                return;
            }
            res.render('admin/editcategory',{categ:categ});
        }catch(err){
            console.error(err);
            res.redirect('admin/category')
        }
    },

    // updateCategory
    adminUpdateCategory:async (req,res)=>{
        const id = req.params.id;
        try{
            const result = await Category.findByIdAndUpdate(id,{
                category:req.body.category,
                description:req.body.description,
            });
            res.redirect('/category');
        }catch(err){
            console.error(err);
            res.json({message : err.message , type :"danger" })
        }
    },

    ProductPublish:async (req,res)=>{
        const id = req.params.id;
        const product = await products.findByIdAndUpdate(id,{ispublished:true});
        res.redirect('/products')
    },
    ProductUnpublish:async (req,res)=>{
        const id = req.params.id;
        const product = await products.findByIdAndUpdate(id,{ispublished:false});
        res.redirect('/products')
    },
    CategoryList:async (req,res)=>{
        const id = req.params.id;
        const category = await Category.findByIdAndUpdate(id,{islisted:true});
        res.redirect('/category')
    },
    CategoryUnlist:async (req,res)=>{
        const id = req.params.id;
        const category = await Category.findByIdAndUpdate(id,{islisted:false});
        res.redirect('/category')
    },
    UserBlock:async (req,res)=>{
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id,{isblocked:false});
        res.redirect('/customer')
    },
    UserUnblock:async (req,res)=>{
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id,{isblocked:true});
        res.redirect('/customer')
    },

}


module.exports = {upload,adminController}