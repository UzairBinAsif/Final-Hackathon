import express from 'express'
import { getAllUsers, updateUser } from '../controllers/userController.js'
import { validateUser } from '../middleware/validateUser.js'


const userRoute = express.Router()

userRoute.get("/", getAllUsers)
userRoute.put("/", validateUser , updateUser)

export default userRoute