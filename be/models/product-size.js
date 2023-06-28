module.exports = (sequelize, DataTypes) => {
	const ProductSize = sequelize.define("Product_Size", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		saleCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
	});
	return ProductSize;
};
