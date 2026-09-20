import type { Request, Response } from 'express';
import { findUserById, findUserByUsername, listUsers, updateUser } from '#repositories/users';

export async function me(request: Request, response: Response): Promise<void> {
  const user = await findUserById(request.authUser!.id);
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(user);
}

export async function updateMe(request: Request, response: Response): Promise<void> {
  const user = await updateUser(request.authUser!.id, request.body);
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(user);
}

export async function stats(request: Request, response: Response): Promise<void> {
  const user = await findUserById(request.authUser!.id);
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json({
    playerLevel: user.playerLevel,
    rank: user.rank,
    totalScore: user.totalScore,
  });
}

export async function byId(request: Request, response: Response): Promise<void> {
  const user = await findUserById(Number(request.params.id));
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(user);
}

export async function byUsername(request: Request, response: Response): Promise<void> {
  const username = request.params.username;
  if (!username || Array.isArray(username)) {
    response.status(400).json({ error: 'Username is required' });
    return;
  }
  const user = await findUserByUsername(username);
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(user);
}

export async function leaderboard(request: Request, response: Response): Promise<void> {
  const page = Math.max(Number(request.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(request.query.limit) || 20, 1), 100);
  const users = await listUsers(limit, (page - 1) * limit);
  response.json({ data: users, pagination: { page, limit } });
}
