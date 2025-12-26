import express from 'express';
import {verifyUser} from '../middleware/authMiddleware.js';
import {permit} from '../middleware/roleMiddleware.js';
import {
    demoteUser,
    getActiveOperatorsAndAdmins,
    promoteUser
} from "../controllers/adminController.js";

const router = express.Router();



// GET /api/admin/operators - restituisce lista utenti con ruolo operator e admin
router.get('/operators', verifyUser, permit("admin"), getActiveOperatorsAndAdmins);

// PATCH /api/admin/promote/ - prende mail nel body
router.patch('/promote', verifyUser, permit("admin"), promoteUser);

// PATCH /api/admin/demote - prende mail nel body
router.patch('/demote', verifyUser, permit("admin"), demoteUser);

export default router;