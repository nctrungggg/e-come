module.exports = (sequelize, DataTypes) => {
	const BigCategory = sequelize.define("big_category", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	return BigCategory;
};
