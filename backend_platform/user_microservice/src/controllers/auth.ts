import type { Request, Response } from 'express';
import {confirmPasswordReset as updatePassword, resetPassword, signIn,signUp,viewUserProfile} from '#repositories/users';
import { createToken, verifyToken } from '#utils/crypto';
import { upload } from '#utils/uploader';
import type { PasswordResetConfirmInput, PasswordResetRequestInput, SignupData, SigninInput } from '#schemas/auth';



export async function signup(request: Request, response: Response): Promise<void> {
  if (typeof request.body.data === 'string') {
    try {
      request.body = JSON.parse(request.body.data);
    } catch {
      response.status(400).json({ error: 'Invalid signup data' });
      return;
    }
  }
  const avatarUrl = request.file ? await upload(request.file) : '';
  const user = await signUp({ ...(request.body as SignupData), avatarUrl });

  if (!user) {
    response.status(409).json({ error: 'Email or username is already registered' });
    return;
  }

  response.status(201).json({
    user: user,
    token: createToken({sub: String(user.id),email: user.email,username: user.username,pLevel: user.playerLevel,}, 60 * 60 * 24),
  });
}

export async function signin(request: Request, response: Response): Promise<void> {
  const user = await signIn(request.body as SigninInput);
  if (!user) {
    response.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  response.json({
    user: user,
    token: createToken({ sub: String(user.id),email: user.email,username: user.username, pLevel: user.playerLevel}, 60 * 60 * 24),
  });
}

export async function requestPasswordReset(request: Request,response: Response): Promise<void> {
  const user = await resetPassword(request.body as PasswordResetRequestInput);
  if (!user) {
    response.json({ message: 'If the account exists, a reset token has been generated' });
    return;
  }

  const token = createToken({ sub: String(user.id), purpose: 'password-reset' }, 15 * 60);
  response.json({
    message: 'If the account exists, a reset token has been generated',
    resetToken: token,
  });
}

export async function confirmPasswordReset( request: Request,  response: Response): Promise<void> {
  const { token, password } = request.body as PasswordResetConfirmInput;
  try {
    const claims = verifyToken(token);
    if (claims.purpose !== 'password-reset') throw new Error('Invalid reset token');
    const user = await updatePassword(Number(claims.sub), password);
    if (!user) {
      response.status(400).json({ error: 'Invalid reset token' });
      return;
    }
    response.json({ message: 'Password reset successfully' });
  } catch {
    response.status(400).json({ error: 'Invalid or expired reset token' });
  }
}

export async function profile(request: Request, response: Response): Promise<void> {
  const user = await viewUserProfile(request.authUser!.id);
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json({ user: user });
}
