import express from 'express';
import { createUsers, getUsers, getUser, deleteUser, updateUser,} from "../controllers/usersControllers.js"

const router = express.Router();

router.get('/all-users', getUsers)
router.get('/user/:id', getUser)
router.post('/user', createUsers);
router.delete('/user/:id', deleteUser)
router.put('/user/:id', updateUser)

export default router;