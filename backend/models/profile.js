const sequelize = require('sequelize')
const db = require('../config/database')

const profile = db.define("profile", 
    { id: { 
        type: sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
    }, 
    vorname:{ 
        type: sequelize.STRING, 
        allowNull: false, 
    }, 
    nachname:{ 
        type: sequelize.STRING, 
        allowNull: false, 
    }, 
    email:{ 
        type: sequelize.STRING, 
        allowNull: false, 
    },
    passwort:{
        type: sequelize.STRING,
        allowNull: false
    },
    createdAt:{
        type: sequelize.DATE,
        allowNull: false,
    },
    updatedAt:{
        type: sequelize.DATE,
        allowNull: false,
    } 
    },
    { tableName: "profile", }); 

module.exports = profile