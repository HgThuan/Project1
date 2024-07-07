const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { error, log } = require("console");
const jwt = require('jsonwebtoken');
 
 
app.use(express.json());
app.use(cors());
 
// Database MongoDB Connection
mongoose.connect("mongodb+srv://hoangvanthuan010:123@cluster0.b0a9r5d.mongodb.net/project1");

 
app.get("/", (req, res) => {
    res.send("Express App is Running");
});


 
// Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});
const upload = multer({ storage: storage });
 
// Creating upload endpoints
app.use('/images', express.static('upload/images'));
 
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});
 
// Schema for Creating Products
const Product = mongoose.model("Product",{
  id:{
    type:Number,
    required:true,
  },
    name:{
      type:String,
      required:true,
    },
    image:{
      type:String,
      required:true
    },
    category:{
      type:String,
      required:true,
    },
    new_price:{
      type:Number,
      required:true
    },
    old_price:{
      type:Number,
      required:true
    },
    date:{
      type:Date,
      default:Date.now,
    },
    avaiable:{
      type:Boolean,
      default:true,
    },
});
//api for add product
app.post('/addproduct', async(req,res)=>{
  try {
      const productCount = await Product.countDocuments();
      const product = new Product({
          id: productCount + 1,
          name: req.body.name,
          image: req.body.image,
          category: req.body.category,
          new_price: req.body.new_price,
          old_price: req.body.old_price,
      });
      console.log(product)
      await product.save();
      console.log("Saved");
      res.json({
          success: true,
          name: req.body.name,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal server error" });
  }
});
 
//Creating API for Deleting Products
app.post('/removeproduct', async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("removed");
    res.json({
      success:true,
      name:req.body.name
    })
})
 
//Creating API for getting all products
app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products)
})
 

//Schema for creating he User Model

//Schema Creating for user Model
const Users = mongoose.model('Users', {
  name:{
    type:String,
  },
  email:{
    type:String,
    unique:true,
  },
  password:{
    type:String,
  },
  cartData:{
    type:Object,
  },
  date:{
    type:Date,
    default:Date.now,
  }
})
//// Add this logging in the signup endpoint to see the request body
app.post('/signup', async(req, res) => {
  console.log("Signup Request Body:", req.body);
 
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, error: "Existing user found with the Email Address" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });
  await user.save();
  const data = {
    user: {
      id: user.id
    }
  }
  const token = jwt.sign(data, 'secret_ecom');
  res.json({
    success: true, token
  });
});
//creating endpoint for the login
app.post('/login', async(req,res)=>{
    let user = await  Users.findOne({email:req.body.email});
    if(user){
      const passCompare = req.body.password === user.password;
     if(passCompare){
      const data = {
        user:{
          id:user.id
        }
      }
      const token = jwt.sign(data,'secret_ecom');
      res.json({success:true,token});
     }
     else{
      res.json({success:false, erorrs:"Wrong Password"});
     }
    }
    else{
      res.json({success:false,errors:"Wrong Email Id"})
    }
})
 
//creating end point for new collection
app.get('/newcollections', async(req,res)=>{
let products = await Product.find({});
let newcollections= products.slice(1).slice(-8);
console.log("New Collection fetched");
res.send(newcollections);
})
 
//popular in woman
app.get('/popularinwomen', async (req,res) =>{
  let products = await Product.find({category:"women"});
  let popularinwomen = products.slice(0,4);
  console.log("Popular in Women fetched");
  res.json(popularinwomen);
})
const fetchUser = async (req, res, next) => {
  try {
      const token = req.header('auth-token');
      if (!token) {
          return res.status(401).send({ errors: "Please Authenticate using a valid token" });
      }
      const data = jwt.verify(token, 'secret_ecom');
      req.user = data.user;
      next();
  } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).send({ errors: "Internal server error" });
  }
}
//creating the newcollections data
app.get('/newcollections',async(req,res)=>
{
let products=await Product.find({});
let newcollection=products.slice(1).slice(-8);
console.log( 'newcollection fetched:',newcollection );
res.send(newcollection);

})
 
// Endpoint to add to cart
app.post('/addtocart', fetchUser, async (req, res) => {
  console.log("Added", req.body.itemId)
  let userData = await Users.findOne({_id:req.user.id});
  userData.cartData[req.body.itemId] =+1;
  await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
  res.send("Added");
    // Add your logic here
  });

 
  app.post('/removeproduct', fetchUser,async(req,res)=>{
    console.log("Removed", req.body.itemId)
    let userData = await Users.findOne({_id:req.user.id});
    if( userData.cartData[req.body.itemId] >0)
    userData.cartData[req.body.itemId] -=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Removed");
  })
 
  app.post('/getcart', fetchUser,async(req,res)=>{
    console.log("getcart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
  })
 
 
// API
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port" + port);
    } else {
        console.log("error" + error);
    }
});
