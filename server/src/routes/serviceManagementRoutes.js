import express from 'express';
import {getServiceStatus, enableRagService , disableRagService} from "../controllers/serviceManagementController.js";
import {verifyUser} from "../middleware/authMiddleware.js";
import {permit} from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get('/status', verifyUser, permit("operator", "admin"), getServiceStatus);

router.post('/enable', verifyUser, permit("operator", "admin"), enableRagService);

router.post('/disable', verifyUser, permit("operator", "admin"), disableRagService);

export default router;
