/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const submissions =  sequelize.define('submissions', {
		id:{
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
		solution: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'solution'
		},
		is_correct: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			field: 'is_correct'
		},
		points: {
			type: DataTypes.FLOAT,
			field: 'points'
		}
	}, {
		tableName: 'submissions'
	});

	submissions.associate = (models) => {
        models.submissions.belongsTo(models.teams, {
            foreignKey: 'team_id',
            targetKey: 'id',
            as: 'team'
		})

		models.submissions.belongsTo(models.test_cases, {
            foreignKey: 'test_case_id',
            targetKey: 'id',
            as: 'testCase'
		})
	}

	return submissions;
};
