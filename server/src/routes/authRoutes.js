import express from 'express';
import {loginUser, registerUser, logoutUser} from '../controllers/authController.js';
import {renewToken, verifyUser} from '../middleware/authMiddleware.js';

const router = express.Router();

//in questo file si definiscono tutte le rotte per la gestione dell'autenticazione
//per verificare l'autenticazione e il rinnovo si usano i middleware in authMiddleware

//POST /api/register
router.post('/register', registerUser);

//POST /api/login
router.post('/login', loginUser);

//GET /api/refresh
router.get('/refresh', renewToken);

//POST /api/logout
router.post('/logout', logoutUser);

//GET /api/protected
router.get('/protected', verifyUser, (req, res) => {
    res.json("Accesso autorizzato")
});

export default router;