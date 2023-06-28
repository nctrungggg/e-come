module.exports = (sequelize, DataTypes) => {
	const Size = sequelize.define("size", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	return Size;
};
