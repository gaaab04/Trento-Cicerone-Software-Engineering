import express from 'express';
import { getServiceStatus, enableRagService, disableRagService } from "../controllers/serviceManagementController.js";
import { verifyUser } from "../middleware/authMiddleware.js";
import { permit } from "../middleware/roleMiddleware.js";

const router = express.Router();

//Solo operatori ed admin possono interagire con lo status del servizio

// GET /api/services/status ritorna lo stato del servizio (true o false)
router.get('/status', verifyUser, permit("operator", "admin"), getServiceStatus);

// POST /api/services/enable abilita il servizio
router.post('/enable', verifyUser, permit("operator", "admin"), enableRagService);

// POST /api/services/disable disabilita il servizio
router.post('/disable', verifyUser, permit("operator", "admin"), disableRagService);

export default router;
