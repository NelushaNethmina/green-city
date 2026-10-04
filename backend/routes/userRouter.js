import express from "express"
import { createUser, getUser, loginUser, updateUserStatus, updateUser, deleteUser, updateMyLocation, createDriver } from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.get("/",getUser)
userRouter.post("/",createUser)
userRouter.post("/driver", createDriver)
userRouter.post("/login", loginUser)
userRouter.put("/toggle-status/:email",updateUserStatus)
userRouter.put("/:id", updateUser)
userRouter.delete("/:id", deleteUser)



export default userRouter