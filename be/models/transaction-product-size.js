module.exports = (sequelize, DataTypes) => {
	const TransactionProductSize = sequelize.define("Transaction_Product_Size", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
            default: 0,
		}
	});
	return TransactionProductSize;
};