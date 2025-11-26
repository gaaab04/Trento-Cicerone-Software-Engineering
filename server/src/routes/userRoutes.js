import express from 'express';
import {changePassword, getMe} from '../controllers/userController.js';
import { verifyUser } from '../middleware/authMiddleware.js';
import { permit } from '../middleware/roleMiddleware.js';

const router = express.Router();

// GET /api/users/me - serve per ottenere id, mail e ruolo dell'utente
router.get('/me', verifyUser, permit("user", "operator", "admin"), getMe);

// PATCH /api/users/changePassword - serve per cambiare la password dell'utente
router.patch('/changePassword', verifyUser, permit("user", "operator", "admin"), changePassword);


export default router;