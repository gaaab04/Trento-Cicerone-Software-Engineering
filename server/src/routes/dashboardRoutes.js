import express from 'express';
import {getFeedbacks, getLastFeedbacksNumber, getLastQuestions} from '../controllers/dashboardController.js';
import {verifyUser} from "../middleware/authMiddleware.js";
import {permit} from "../middleware/roleMiddleware.js";



const router = express.Router();

// GET /api/dashboard/feedback
router.get('/feedback', verifyUser, permit("operator", "admin"), getFeedbacks);

// GET /api/dashboard/feedback/stats - recupera numero feedback (permesso a operatori e admin)
router.get('/feedback/stats', verifyUser, permit("operator", "admin"), getLastFeedbacksNumber);

//GET /api/dashboard/last-questions?limit=X - recupera ultime X domande (permesso a operatori e admin)
router.get('/last-questions', verifyUser, permit("operator", "admin"), getLastQuestions)

export default router;