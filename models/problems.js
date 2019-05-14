/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const problems = sequelize.define('problems', {
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
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'description'
		},
		exampleTestCase: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'example_test_case'
		},
		unlockedDay: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'unlocked_day'
		},
		points: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'points'
		},
		displayMetadata: {
			type: DataTypes.JSON,
			allowNull: false,
			field: 'display_metadata'
		}
	}, {
		tableName: 'problems'
	});

	return problems
};
