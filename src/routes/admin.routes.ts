import { Router } from 'express';
import { protectAdmin, authorizeAdmin } from '../middlewares/admin-auth';
import { loginAdmin, changePassword } from '../controllers/admin-auth.controller';
import {
  createAdmin,
  getAdmins,
  deleteAdmin,
  toggleBlockAdmin,
  getUsers,
  toggleBlockUser,
  getUserStats,
} from '../controllers/admin.controller';
import {
  getDriverPayments,
  getAllPendingPayments,
  updatePaymentStatus,
  generateMonthlyPayments,
} from '../controllers/payment.controller';
import { getCommissionRate, updateCommissionRate } from '../controllers/commission.controller';

const router = Router();

// Auth Admin
router.post('/auth/login', loginAdmin);

// Route publique pour récupérer le taux de commission (accessible à tous)
router.get('/commission', getCommissionRate);

// Routes protégées (toutes les routes ci-dessous nécessitent une authentification)
router.use(protectAdmin);

// Changer le mot de passe (tous les admins)
router.put('/auth/change-password', changePassword);

// Admin Management (Super Admin only)
router.post('/admins', authorizeAdmin('super_admin'), createAdmin);
router.get('/admins', authorizeAdmin('super_admin'), getAdmins);
router.delete('/admins/:id', authorizeAdmin('super_admin'), deleteAdmin);
router.put('/admins/:id/block', authorizeAdmin('super_admin'), toggleBlockAdmin);

// User Management (Admin, Super Admin)
router.get('/users', authorizeAdmin('admin', 'super_admin'), getUsers);
router.get('/users/:id/stats', authorizeAdmin('admin', 'super_admin'), getUserStats);
router.put('/users/:id/block', authorizeAdmin('admin', 'super_admin'), toggleBlockUser);

// Payment Management (Admin, Super Admin)
router.get('/payments/drivers/:driverId', authorizeAdmin('admin', 'super_admin'), getDriverPayments);
router.get('/payments/pending', authorizeAdmin('admin', 'super_admin'), getAllPendingPayments);
router.put('/payments/:id/status', authorizeAdmin('admin', 'super_admin'), updatePaymentStatus);
router.post('/payments/generate-monthly', authorizeAdmin('super_admin'), generateMonthlyPayments);

// Commission Management (Super Admin only for PUT)
router.put('/commission', authorizeAdmin('super_admin'), updateCommissionRate);

export default router;
