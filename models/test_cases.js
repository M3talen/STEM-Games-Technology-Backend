/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const testCases = sequelize.define('test_cases', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		input: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'input'
		},
		expectedOutput: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'expected_output'
		}
	}, {
		tableName: 'test_cases'
	});

	testCases.associate = (models) => {
        models.test_cases.belongsTo(models.problems, {
            foreignKey: 'problem_id',
            targetKey: 'id',
            as: 'problem'
		})
	}

	return testCases;
};
