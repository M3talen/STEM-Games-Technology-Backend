/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const mapBlocks = sequelize.define('mapBlocks', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
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
		blockData: {
			type: DataTypes.JSON,
			allowNull: true,
			field: "block_data"
		},
		blockType: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: "block_type"
		},
		displayMetadata: {
			type: DataTypes.JSON,
			allowNull: true,
			field: 'display_metadata'
		}
	},{
		tableName: 'map_blocks'
	});

	mapBlocks.associate = (models) => {
        models.mapBlocks.belongsTo(models.problems, {
            foreignKey: 'problem_id',
            targetKey: 'id',
			as: 'problem',
			
		})
	}

	return mapBlocks;
};
