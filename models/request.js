/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const request = sequelize.define('request', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
        },
        teamId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field:'team_id'
        },
		body: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'body'
		},
		route: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'route'
		}
	}, {
		tableName: 'request'
	});

	return request
};
