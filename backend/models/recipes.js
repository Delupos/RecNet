const sequelize = require('sequelize')
const db = require('../config/database')

const recipes = db.define('recipes',
    { recId: { 
        type: sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true,
    },
    titel: {
        type: sequelize.STRING,
        allowNull: false
    },
    zutaten: {
        type: sequelize.STRING,
        allowNull: false
    },
    zubereitung: {
        type: sequelize.STRING,
        allowNull: false
    },
    preis: {
        type: sequelize.STRING,
        allowNull: false
    },
    dauer: {
        type: sequelize.STRING,
        allowNull: false
    },
    kategorie: {
        type: sequelize.STRING,
        allowNull: true        
    },
    id: {
        type: sequelize.INTEGER, 
        allowNull: false,
    }
    },
    { tableName: "recipes", });

module.exports = recipes
