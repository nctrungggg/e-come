const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	const Product = sequelize.define(
		"product",
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			slug: {
				type: DataTypes.STRING,
			},
			price: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
			},
			coverImage: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			salePrice: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			deletedAt: {
				type: Sequelize.DATE,
				allowNull: true,
				defaultValue: null,
			},
		},
		{
			paranoid: true,
		}
	);
	return Product;
};
