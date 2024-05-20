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
import habitacionRoutes from '../src/habitacion/habitacion.routes.js'
import reservacionRoutes from '../src/reservacionHabitacion/reservacionHab.routes.js'
import eventosRoutes from '../src/eventos/eventos.routes.js'
import listaRoutes from '../src/listaEspera/listaEspera.routes.js'

class Server{
    constructor(){
        this.app = express()
        this.port = process.env.PORT
        this.registroPath = '/trivaguito/v1/registro'
        this.authPath = '/trivaguito/v1/auth'
        this.hotelPath = '/trivaguito/v1/hotel'
        this.habitacionPath = '/trivaguito/v1/habitacion'
        this.reservacionPath = '/trivaguito/v1/reservacion'
        this.eventosPath = '/trivaguito/v1/eventos'
        this.listaPath = '/trivaguito/v1/listaEspera'

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
        this.app.use(this.habitacionPath, habitacionRoutes)
        this.app.use(this.reservacionPath, reservacionRoutes)
        this.app.use(this.eventosPath, eventosRoutes)
        this.app.use(this.listaPath, listaRoutes)
    }

    listen(){
        this.app.listen(this.port, () => {
            console.log('Server running on port ', this.port)
        })
    }
}

export default Server