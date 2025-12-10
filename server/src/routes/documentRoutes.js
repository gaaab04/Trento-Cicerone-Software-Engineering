import express from 'express';
import {verifyUser} from "../middleware/authMiddleware.js";
import {permit} from "../middleware/roleMiddleware.js";
import {
    addDocument,
    deleteDocument,
    getCategories,
    getDocuments,
    updateDocument
} from "../controllers/documentController.js";

const router = express.Router();

// POST /api/documents
router.post('/', verifyUser, permit( "operator", "admin"), addDocument);

// PATCH /api/documents/:id
router.patch('/:id', verifyUser, permit( "operator", "admin"), updateDocument);

// DELETE /api/documents/:id
router.delete('/:id', verifyUser, permit( "operator", "admin"), deleteDocument);

// GET /api/documents
router.get('/', verifyUser, permit( "operator", "admin"), getDocuments);

// GET /api/documents/categories
router.get('/categories', verifyUser, permit( "operator", "admin"), getCategories);
export default router;