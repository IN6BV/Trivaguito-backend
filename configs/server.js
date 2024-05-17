'use strict'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { dbConnection } from './mongo.js'
import { adminPlatform } from '../src/registro/registro.controller.js'
import registroRoutes from '../src/registro/registro.routes.js'
import authRoutes from '../src/auth/auth.routes.js'
import hotelRoutes from '../src/hotel/hotel.routes.js'

class Server{
    constructor(){
        this.app = express()
        this.port = process.env.PORT
        this.registroPath = '/trivaguito/v1/registro'
        this.authPath = '/trivaguito/v1/auth'
        this.hotelPath = '/trivaguito/v1/hotel'

        this.middlewares()
        this.conectarDB()
        this.routes()
    }

    async conectarDB(){
        await dbConnection()
        await adminPlatform()
    }

    middlewares(){
        this.app.use(express.urlencoded({extended: false}))
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(helmet())
        this.app.use(morgan('dev'))
    }

    routes(){
        this.app.use(this.registroPath, registroRoutes)
        this.app.use(this.authPath, authRoutes)
        this.app.use(this.hotelPath, hotelRoutes)
    }

    listen(){
        this.app.listen(this.port, () => {
            console.log('Server running on port ', this.port)
        })
    }
}

export default Server