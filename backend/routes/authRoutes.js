import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  getUserCourses,
  registerUserCourseController,
  updateUserCourseProgressController,
  getMarketplaceProductsController,
  createMarketplaceProductController,
  updateMarketplaceProductStockController,
  updateMarketplaceProductController,
  deleteMarketplaceProductController,
  purchaseMarketplaceController,
  getFinanzasController,
  createFinanzasMovimientoController,
  updateFinanzasMetasController,
  listUsers,
  updateUserRoleController,
  revealUserPasswordController,
  resetUserPasswordController,
  listCoursesController,
  listCoursesPublicController,
  createCourseController,
  updateCourseController,
  deleteCourseController,
  listOpportunitiesController,
  listOpportunitiesPublicController,
  createOpportunityController,
  updateOpportunityController,
  deleteOpportunityController,
} from '../controllers/authController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import {
  listPosts,
  getPost,
  createPostController,
  updatePostController,
  deletePostController,
  createCommentController,
  deleteCommentController,
  toggleReactionController,
} from '../controllers/communityController.js';

const router = express.Router();

// Rutas públicas
router.post('/register', register);           // RF-1.1
router.post('/login', login);                  // RF-1.2
router.post('/forgot-password', forgotPassword); // RF-1.3
router.post('/reset-password', resetPassword); // RF-1.3

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, getProfile);              // RF-1.4
router.put('/profile', authenticateToken, updateProfile);           // RF-1.4
router.put('/change-password', authenticateToken, changePassword);  // RF-1.4
router.get('/courses', authenticateToken, getUserCourses);
router.post('/courses/register', authenticateToken, registerUserCourseController);
router.put('/courses/progress', authenticateToken, updateUserCourseProgressController);
router.get('/marketplace', authenticateToken, getMarketplaceProductsController);
router.post('/marketplace', authenticateToken, createMarketplaceProductController);
router.put('/marketplace/:id/stock', authenticateToken, updateMarketplaceProductStockController);
router.put('/marketplace/:id', authenticateToken, updateMarketplaceProductController);
router.delete('/marketplace/:id', authenticateToken, deleteMarketplaceProductController);
router.post('/marketplace/purchase', authenticateToken, purchaseMarketplaceController);
router.get('/finanzas', authenticateToken, getFinanzasController);
router.post('/finanzas/movimientos', authenticateToken, createFinanzasMovimientoController);
router.put('/finanzas/metas', authenticateToken, updateFinanzasMetasController);
router.get('/cursos/public', listCoursesPublicController);
router.get('/opportunities/public', listOpportunitiesPublicController);

// Comunidad (foro)
router.get('/community/posts', listPosts);
router.get('/community/posts/:id', getPost);
router.post('/community/posts', authenticateToken, createPostController);
router.put('/community/posts/:id', authenticateToken, updatePostController);
router.delete('/community/posts/:id', authenticateToken, deletePostController);
router.post('/community/posts/:id/comments', authenticateToken, createCommentController);
router.delete('/community/comments/:id', authenticateToken, deleteCommentController);
router.post('/community/posts/:id/react', authenticateToken, toggleReactionController);

// Rutas administrativas (requieren autenticación y rol admin)
router.get('/users', authenticateToken, isAdmin, listUsers);                           // RF-1.5
router.put('/users/role', authenticateToken, isAdmin, updateUserRoleController);       // RF-1.5
router.post('/users/:id/reveal-password', authenticateToken, isAdmin, revealUserPasswordController); // RF-1.5
router.post('/users/:id/reset-password', authenticateToken, isAdmin, resetUserPasswordController); // RF-1.5
router.get('/admin/courses', authenticateToken, isAdmin, listCoursesController);
router.post('/admin/courses', authenticateToken, isAdmin, createCourseController);
router.put('/admin/courses/:id', authenticateToken, isAdmin, updateCourseController);
router.delete('/admin/courses/:id', authenticateToken, isAdmin, deleteCourseController);
router.get('/admin/opportunities', authenticateToken, isAdmin, listOpportunitiesController);
router.post('/admin/opportunities', authenticateToken, isAdmin, createOpportunityController);
router.put('/admin/opportunities/:id', authenticateToken, isAdmin, updateOpportunityController);
router.delete('/admin/opportunities/:id', authenticateToken, isAdmin, deleteOpportunityController);

export default router;
