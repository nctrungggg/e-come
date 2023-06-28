const db = require("../models");
const product = db.models.Product;
const size = db.models.Size;

const sizeController = {
	getAllSize: async (req, res, next) => {
		let Size = await size.findAll({});
		return res.status(200).json(Size);
	},
	getSizeById: async (req, res, next) => {
		let id = req.params.id;
		try {
			let Size = await size.findByPk(id, {
				include: [
					{
						model: product,
						attributes: [
							"name",
							"price",
							"coverImage",
							"salePrice",
							"description",
						],
					},
				],
			});
			return res.status(200).json(Size);
		} catch (error) {
			console.log(error);
		}
	},
	updateSize: async (req, res, next) => {
		let id = req.params.id;
		let { ...body } = req.body;
		let Size = await size.findByPk(id);
		if (!Size) {
			throw new ErrorResponse("Không tìm thấy product", 404);
		}
		await Size.update(body);
		return res.status(200).json(Size);
	},
	deleteSize: async (req, res, next) => {
		let id = req.params.id;
		let Size = await size.findByPk(id);
		if (!Size) {
			throw new ErrorResponse("Không tìm thấy product", 404);
		}
		await Size.destroy();
		return res.status(200).json(Size);
	},
	createSize: async (req, res, next) => {
		let { ...body } = req.body;
		let Size = await size.create(body);
		return res.status(201).json(Size);
	},
};

module.exports = sizeController;
