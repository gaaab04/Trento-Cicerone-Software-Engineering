import express from 'express';
import {verifyUser} from '../middleware/authMiddleware.js';
import {permit} from '../middleware/roleMiddleware.js';
import {demoteUser, promoteUser} from "../controllers/adminController.js";

const router = express.Router();

//tutte le rotte qui sotto sono accessibili  solo ad admin
router.use(verifyUser, permit("admin"));

// PATCH /api/access/admin/promote/:id
router.patch('/promote/:id', promoteUser);

// PATCH /api/access/admin/demote/:id
router.patch('/demote/:id', demoteUser);

export default router;