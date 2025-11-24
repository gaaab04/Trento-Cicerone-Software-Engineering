import express from 'express';
import { getFaqs, createFaq, updateFaq, deleteFaq } from './faqController.js';

const router = express.Router();

//Poi quando sui usa il router bisogna specificare
/*
import faqRoutes from './faqRoutes.js';
app.use('/api/faqs', faqRoutes)
*/

// READ ALL: GET /api/faqs, rotta aperta a tutti
router.get('/', getFaqs);

// CREATE: POST /api/faqs, rotta apera solo per operatori e admin
router.post('/', createFaq);

// UPDATE: PUT /api/faqs/:id
router.put('/:id', updateFaq);

// DELETE: DELETE /api/faqs/:id, rotta aperta solo per operatori e admin
router.delete('/:id', deleteFaq);

export default router;