/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const teams = sequelize.define('teams', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'name'
		},
		x: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'x'
		},
		y: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'y'
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'username'
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'password'
		},
		points: {
			type: DataTypes.FLOAT,
			allowNull: false,
			field: 'points'
		},
		solved: {
			type: DataTypes.TEXT,
			field: 'solved'
		},
		statistics: {
			type: DataTypes.TEXT,
			field: 'statistics'
		}
	}, {
			tableName: 'teams'
		});

	return teams;
};
