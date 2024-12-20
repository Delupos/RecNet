const bcrypt = require('bcrypt')
const uuid = require('uuid')
const express = require('express')
const app = express()
const port = 3002
const db = require('../config/database')
const profile = require('../models/profile')
const recipes = require('../models/recipes')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const secTok = require('../testdaten.json')["secret-key"]["jwt"]
const { where, Sequelize, Op } = require('sequelize')

profile.hasMany(recipes, {
    foreignKey: 'id',
})

recipes.belongsTo(profile, {
    foreignKey: 'id',
})

app.listen(port, () => { 
    console.log(`Example app listening on port ${port}`) })

db.authenticate() 
    .then(() => console.log("database connected")) 
    .catch(err => console.log("Error" + err)) 
db.sync() 
app.use(cors()) 
let corsOptions = { origin: '*', optionSuccessStatus: 200, 
    methods: ['GET', 'PUT', 'POST', 'DELETE']}

app.use(cors(corsOptions))
app.use(express.json())

app.use(async(req, res, next) => {
    try{
        if(req.path.includes("checkProfileForLogin") || req.path.includes("createProfile")){
            return next()
        }
    
        
        const token = req.headers.authorization
        if(!token){
            return res.status(401).json({
                success: false
            })
        }
    
        if(jwt.verify(token, secTok, {ignoreExpiration: false})){
            return next()
    
        } else {
            res.status(401).json({
                success: false
            })
        }
    } catch (err) {
        res.status(401).json({
            success: false,
            error: err
        })
    }
})

app.get("/", async(req, res, next) => {
    res.status(200).send()
})

app.post('/createProfile', async(req, res) => {
    try{
        
        const temp_profile = {
            vorname: req.body.vorname,
            nachname: req.body.nachname,
            email: req.body.email,
            passwort: await bcrypt.hash(req.body.passwort, 10),
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if(emailRegex.test(temp_profile.email)){
            
            await profile.create(temp_profile)
    
            res.status(200).json({
                success: true
            })

        } else {
            res.status(400).json({
                success: false,
                error: "Invalid E-Mail"
            })
        }

    } catch(err) {
        res.status(500).json({
            success: false,
            error: err
        })
    }
})

app.get('/getProfiles', async(req, res) => {
    try {
        const result = await profile.findAll({
            order: [
                ["id", "ASC"]
            ]
        })

        res.status(200).json({
            success: true,
            data: result
        })
    } catch(err) {
        res.status(500).json({
            success: false,
            error: err
        })
    }
})

app.get('/checkProfileForLogin/:email', async(req, res) => {
    try{
        const result = await profile.findOne({
            where: {
                email: req.params.email,
            }
        })

        const check = await bcrypt.compare(req.query["passwort"], result.dataValues.passwort)

        if(check){

            const token = jwt.sign({
                vorname: result.dataValues.vorname,
                nachname: result.dataValues.nachname,
                email: result.dataValues.email,
                id: result.dataValues.id},
                secTok, {
                expiresIn: '1h'})
                
            
            res.status(200).json({
                success: true,
                data: token,
            })
        } else {
            res.status(404).json({
                success: false,
                error: "Not found!!"
            })
        }

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err
        })
    }
})

app.get('/getAllRecipes', async(req, res) => {
    try {
        const result = await recipes.findAll({
            order: [
                ["recId", "ASC"]
            ]
        })

        res.status(200).json({
            success: true,
            data: result,
        })
        
    } catch(err) {
        res.status(500).json({
            success: false,
            error: err
        })
    }
})

app.post('/createRecipe', async(req, res) => {
    try {

        const temp_recipe = {
            titel: req.body.titel,
            zutaten: req.body.zutaten,
            zubereitung: req.body.zubereitung,
            preis: req.body.preis,
            dauer: req.body.dauer,
            id: req.body.id,
            kategorie: req.body.kategorie
        }

        await recipes.create(temp_recipe)

        res.status(200).json({
            succes: true
        })

    } catch(err) {
        res.status(500).json({
            success: false,
            error: err
        })
    }
})

app.post('/getFilteredRecipes', async(req, res) => {
    try {

        const result = await recipes.findAndCountAll({
            include: [{
                model: profile,
                on: {
                    col1: Sequelize.where(Sequelize.col('recipes.id'), '=', Sequelize.col('profile.id'))
                }
            }],
            order: [
                ["id", "DESC"]
            ],
            where: {
                [Op.or] : [
                    {
                        titel:
                        {
                            [Op.substring]: req.body.info
                        }
                    },
                    {
                        zutaten:
                        {
                            [Op.substring]: req.body.info
                        }
                    },
                    {
                        zubereitung:
                        {
                            [Op.substring]: req.body.info
                        }
                    },
                    {
                        preis:
                        {
                            [Op.substring]: req.body.info
                        }
                    },
                    {
                        dauer:
                        {
                            [Op.substring]: req.body.info
                        }
                    },
                    {
                        kategorie:
                        {
                            [Op.substring]: req.body.info
                        }
                    }
                ]
            },
            limit: req.query.limit,
            offset: req.query.offset
        })

        res.status(200).json({
            success: true, 
            data: result.rows,
            count: result.count
        }) 

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err
        })
    }
})

app.get('/getRecipeById/:id', async(req, res) => {
    try{

        const result = await recipes.findOne({
            where: {
                "recId": req.params.id,
            }
        })

        res.status(200).json({
            success: true,
            data: result
        })

    } catch(err) {
        res.status(500).json({
            succces: false,
            error: err
        })
    }
})

app.post('/getRecipeByCategorie', async(req, res) => {
    try{

        const result = await recipes.findAll({
            include: [{
                model: profile,
                on: {
                    col1: Sequelize.where(Sequelize.col('recipes.id'), '=', Sequelize.col('profile.id'))
                }
            }],
            order: [
                ["id", "DESC"]
            ],
            where: {
                [Op.or] : [
                    {
                        kategorie:
                        {
                            [Op.substring]: req.body.kategorie
                        }
                    }
                ]
            },
        })

        res.status(200).json({
            success: true,
            data: result
        })

    } catch(err) {
        res.status(500).json({
            succces: false,
            error: err
        })
    }
})