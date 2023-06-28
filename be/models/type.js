module.exports = (sequelize, DataTypes) => {
	const Type = sequelize.define("type", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	return Type;
};
