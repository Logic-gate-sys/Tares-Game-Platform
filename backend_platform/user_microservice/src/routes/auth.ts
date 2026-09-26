import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  confirmPasswordReset,
  requestPasswordReset,
  signin,
  signup,
} from '#controllers/auth';
import { validate } from '#middlewares/validate';
import { avatarUpload } from '#middlewares/upload';
import {passwordResetConfirmSchema,passwordResetRequestSchema,signinSchema,signupSchema} from '#schemas/auth';

const router = Router();

function parseMultipartSignup(request: Request, _response: Response, next: NextFunction): void {
  if (typeof request.body.data === 'string') {
    try {
      request.body = JSON.parse(request.body.data);
    } catch {
      request.body = {};
    }
  }
  next();
}

router.post(['/register', '/signup'], avatarUpload.single('avatar'), parseMultipartSignup, validate(signupSchema), signup);
router.post('/login', validate(signinSchema), signin);
router.post('/forgot-password', validate(passwordResetRequestSchema), requestPasswordReset);
router.post('/reset-password', validate(passwordResetConfirmSchema), confirmPasswordReset);

export default router;
