import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats
} from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER), getAllUsers);
router.get('/stats', authorize(UserRole.SUPER_ADMIN), getUserStats); // for user statistics like total users
router.get('/:userId', authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE), getUserById);
router.put('/:userId', authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE), updateUser);
router.delete('/:userId', authorize(UserRole.SUPER_ADMIN), deleteUser);

export default router;