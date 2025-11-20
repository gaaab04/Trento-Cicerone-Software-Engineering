import express from 'express';
import {verifyUser} from '../middleware/authMiddleware.js';
import {permit} from '../middleware/roleMiddleware.js';
import {getPublic, getOperator, getAdmin} from '../controllers/roleController.js';

const router = express.Router();

//rotte basate sui ruoli, tutte le rotte richiedono che l'utente sia utenticato tramite verifyUser
// il middleware permit (in roleMiddleware)  controlla che l'utente abbia il ruolo richiesto

// rotta aperta a tutti -> GET /api/access/public
router.get('/public', verifyUser, permit("user", "operator", "admin"), getPublic);

// rotta aperta a operatori e admin -> GET /api/access/operator
router.get('/operator', verifyUser, permit("operator", "admin"), getOperator);

// rotta aperta solo ad admin -> GET /api/access/admin
router.get('/admin', verifyUser, permit("admin"), getAdmin);

export default router;