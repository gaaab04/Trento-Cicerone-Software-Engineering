import express from 'express';
import {
    changePassword,
    getMe, getSuspendedUsers,
    getSuspiciousUsers,
    getUserMessages,
    suspendUser, suspendUserByEmail,
    unsuspendUser, unsuspendUserByEmail
} from '../controllers/userController.js';
import { verifyUser } from '../middleware/authMiddleware.js';
import { permit } from '../middleware/roleMiddleware.js';

const router = express.Router();

// GET /api/users/me - serve per ottenere id, mail e ruolo dell'utente
router.get('/me', verifyUser, permit("user", "operator", "admin"), getMe);

// GET /api/users/suspicious - ottiene utenti con molti messaggi - si possono modificare i parametri mettendo alla fine ?maxMessages=X&hours=Y
router.get('/suspicious', verifyUser, permit("operator", "admin"), getSuspiciousUsers)

// GET /api/users/suspended - ottiene lista utenti bannati
router.get ('/suspended', verifyUser, permit("operator", "admin"), getSuspendedUsers)

// GET /api/users/:userId/messages - recupera i messaggi di un utente specifico - alla fine si può mettere ?hours=X&limit=Y
router.get('/:userId/messages', verifyUser, permit("operator", "admin"), getUserMessages)

// PATCH /api/users/changePassword - serve per cambiare la password dell'utente
router.patch('/changePassword', verifyUser, permit("user", "operator", "admin"), changePassword);

// PATCH /api/users/suspend - serve per bannare un utente passando la mail nel body della richiesta
router.patch('/suspend', verifyUser, permit("operator", "admin"), suspendUserByEmail);

// PATCH /api/users/unsuspend - serve per sbannare un utente passando la mail nel body della richiesta
router.patch('/unsuspend', verifyUser, permit("operator", "admin"), unsuspendUserByEmail);

//PATCH /api/users/:userId/suspend - serve per bannare un utente tramite il suo id
router.patch('/:userId/suspend', verifyUser, permit("operator", "admin"), suspendUser);

//PATCH /api/users/:userId/suspend - serve per sbannare un utente tramite il suo id
router.patch('/:userId/unsuspend', verifyUser, permit("operator", "admin"), unsuspendUser);


export default router;