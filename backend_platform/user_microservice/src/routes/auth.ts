import { Router, type Request, type Response, type NextFunction } from 'express';
import {confirmPasswordReset, requestPasswordReset,signin,signup} from '#controllers/auth';
import { validate } from '#middlewares/validate';
import { avatarUpload } from '#middlewares/upload';
import {passwordResetConfirmSchema,passwordResetRequestSchema,signinSchema,signupSchema} from '#schemas/auth';

const router = Router();

function parseMultipartAuth(request: Request, _response: Response, next: NextFunction): void {
  if (typeof request.body.data === 'string') {
    try {
      request.body = JSON.parse(request.body.data);
    } catch {
      request.body = {};
    }
  }
  if (typeof request.body.password === 'string') {
    try {
      request.body.password = JSON.parse(request.body.password);
    } catch {
      // A plain password string is also accepted by the validation schema.
    }
  }
  next();
}

function requireAvatar(request: Request, response: Response, next: NextFunction): void {
  if (!request.file) {
    response.status(400).json({ error: 'Avatar image is required' });
    return;
  }
  next();
}

router.post(
  ['/register', '/signup'],
  avatarUpload.single('avatar'),
  requireAvatar,
  parseMultipartAuth,
  validate(signupSchema),
  signup,
);
router.post(
  '/login',
  avatarUpload.none(),
  parseMultipartAuth,
  validate(signinSchema),
  signin,
);
router.post('/forgot-password', validate(passwordResetRequestSchema), requestPasswordReset);
router.post('/reset-password', validate(passwordResetConfirmSchema), confirmPasswordReset);

export default router;
