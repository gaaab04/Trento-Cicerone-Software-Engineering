import express from 'express';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faqController.js';
import { verifyUser } from '../middleware/authMiddleware.js';
import { permit } from '../middleware/roleMiddleware.js';



const router = express.Router();



// READ ALL: GET /api/faqs, rotta aperta a tutti
router.get('/', verifyUser, permit("user", "operator", "admin"), getFaqs);

// CREATE: POST /api/faqs, rotta apera solo per operatori e admin
router.post('/', verifyUser, permit("operator", "admin"), createFaq);

// UPDATE: PUT /api/faqs/:id, rotta apera solo per operatori e admin
router.put('/:id', verifyUser, permit("operator", "admin"), updateFaq);

// DELETE: DELETE /api/faqs/:id, rotta aperta solo per operatori e admin
router.delete('/:id', verifyUser, permit("operator", "admin"), deleteFaq);

export default router;