const express = require("express");
const router = express.Router();
const { getAllSize, createSize, getSizeById, updateSize, deleteSize } = require("../controller/sizeController");
const asyncHandle = require("../middlewares/asyncHandle");

//Lấy tất cả thông tin về kích cỡ sản phẩm
router.route("/").get(asyncHandle(getAllSize));

//Lấy thông tin 1 kích cỡ sản phẩm theo id
router.route("/:id").get(asyncHandle(getSizeById));

module.exports = router;
