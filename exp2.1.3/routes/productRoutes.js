const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

router.get("/", productController.getProducts);

router.get("/new", productController.newProductForm);

router.post("/", productController.createProduct);

router.get("/:id", productController.showProduct);

router.get("/:id/edit", productController.editProductForm);

router.post("/:id/update", productController.updateProduct);

router.post("/:id/delete", productController.deleteProduct);

module.exports = router;