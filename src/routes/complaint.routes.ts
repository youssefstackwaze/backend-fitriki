import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
} from '../controllers/complaint.controller';
import { createComplaintValidator } from '../validators/complaint.validator';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Créer une réclamation
router.post('/', validate(createComplaintValidator), createComplaint);

// Récupérer mes réclamations
router.get('/my', getMyComplaints);

// Récupérer les détails d'une réclamation
router.get('/:id', getComplaintById);

export default router;












