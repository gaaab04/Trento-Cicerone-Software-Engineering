import express from 'express';
import {verifyUser} from '../middleware/authMiddleware.js';
import {permit} from '../middleware/roleMiddleware.js';
import {
    demoteUser,
    getActiveOperatorsAndAdmins,
    promoteUser
} from "../controllers/adminController.js";

const router = express.Router();

//tutte le rotte qui sotto sono accessibili solo ad admin
router.use(verifyUser, permit("admin"));

// GET /api/admin/operators
router.get('/operators', verifyUser, permit("admin"), getActiveOperatorsAndAdmins);

// PATCH /api/access/admin/promote/ - prende mail nel body
router.patch('/promote', verifyUser, permit("admin"), promoteUser);

// PATCH /api/access/admin/demote - prende mail nel body
router.patch('/demote', verifyUser, permit("admin"), demoteUser);

export default router;