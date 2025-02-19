const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, 'views'));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage: storage });

// Define a Mongoose model
const Product = mongoose.model(
  "Product",
  new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true },
    description: { type: String },
    standard: { type: String },
    application: { type: String },
    productImg: { type: String, required: false }, // Cloudinary URL
  })
);

// Admin Panel Routes

// Display all products
app.get('/admin', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('admin/products', { products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Form to Add Product
app.get('/admin/add', (req, res) => {
  res.render('admin/addProduct');
});

// Add Product
app.post('/admin/add', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const result = await cloudinary.uploader.upload(req.file.path);
    const newProduct = new Product({ 
      name: req.body.name,
      number: req.body.number,
      description: req.body.description,
      standard: req.body.standard,
      application: req.body.application,
      productImg: result.secure_url,
    });
    await newProduct.save();
    res.redirect('/admin');
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).send('Error uploading image');
  }
});

// Delete Product
app.post('/admin/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete the product from the database
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Optionally, delete the image from Cloudinary (if needed)
    // if (product.productImg) {
    //   const publicId = product.productImg.split('/').pop().split('.')[0]; // Extracting the public ID from URL
    //   await cloudinary.uploader.destroy(publicId);
    // }

    res.redirect('/admin');
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Internal Server Error");
  }
});







// client side rendering
app.get("/", async (req, res) => {
  const products = await Product.find();  
  res.render("client/index",{  products } );
});


app.get('/about', (req, res) => {
    res.render('client/about'); 
  });
  

  app.get('/products', async (req, res) => {
  const products = await Product.find();
    res.render('client/products',{  products } ); 
});

app.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    let products;

    if (query) {
      products = await Product.find({
        name: { $regex: query, $options: "i" }, // Case-insensitive search
      });
    } else {
      products = await Product.find();
    }

    res.render("client/search", { products });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.get('/contact', (req, res) => {
  res.render('client/contact'); 
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});