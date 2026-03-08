const Product = require("../models/Product");

exports.getProducts = async(req,res)=>{
const products = await Product.find();
res.render("products/index",{products});
};

exports.newProductForm = (req,res)=>{
res.render("products/create");
};

exports.createProduct = async(req,res)=>{

const {name,price,description,image} = req.body;

await Product.create({
name,
price,
description,
image
});

res.redirect("/products");
};

exports.showProduct = async(req,res)=>{

const product = await Product.findById(req.params.id);

res.render("products/show",{product});
};

exports.editProductForm = async(req,res)=>{

const product = await Product.findById(req.params.id);

res.render("products/edit",{product});
};

exports.updateProduct = async(req,res)=>{

const {name,price,description,image} = req.body;

await Product.findByIdAndUpdate(req.params.id,{
name,
price,
description,
image
});

res.redirect("/products");
};

exports.deleteProduct = async(req,res)=>{

await Product.findByIdAndDelete(req.params.id);

res.redirect("/products");
};