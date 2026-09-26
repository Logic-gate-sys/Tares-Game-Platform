import { Router } from 'express';
import { authorize } from '#middlewares/authorize';
import { byId, byUsername, me, stats, updateMe, leaderboard } from '#controllers/users';

const router = Router();
router.get('/leaderboard', leaderboard);
router.get('/me', authorize, me);
router.patch('/me', authorize, updateMe);
router.get('/me/stats', authorize, stats);
router.get('/by-username/:username', byUsername);
router.get('/:id', byId);

export default router;
