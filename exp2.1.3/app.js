const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://arpitgoodmansotra_db_user:1234567890@cluster0.xxw6hzp.mongodb.net/?appName=Cluster0")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.use("/products", productRoutes);

app.get("/", (req,res)=>{
res.redirect("/products");
});

const PORT = 3000;

app.listen(PORT, ()=>{
console.log("Server running on port", PORT);
});