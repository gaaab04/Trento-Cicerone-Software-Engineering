import express from 'express';
import { getMe } from '../controllers/userController.js';
import { verifyUser } from '../middleware/authMiddleware.js';
import { permit } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/me', verifyUser, permit("user", "operator", "admin"), getMe);

export default router;