import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app.ts';
import { createTestUser } from '../helpers/testHelpers.ts';

describe('Users and leaderboard integration tests', () => {
  it('returns the authenticated user stats', async () => {
    const user = await createTestUser({ totalScore: 875 });

    const response = await request(app)
      .get('/api/v1/users/me/stats')
      .set('Authorization', `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      playerLevel: '1',
      rank: 'unranked',
      totalScore: 875,
    });
  });

  it('rejects stats requests without authentication', async () => {
    const response = await request(app).get('/api/v1/users/me/stats');

    expect(response.status).toBe(401);
  });

  it('returns a user by id', async () => {
    const user = await createTestUser();

    const response = await request(app).get(`/api/v1/users/${user.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(user.id);
    expect(response.body.username).toBe(user.username);
  });

  it('returns a user by username', async () => {
    const user = await createTestUser();

    const response = await request(app)
      .get(`/api/v1/users/by-username/${encodeURIComponent(user.username)}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(user.email);
  });

  it('updates the authenticated user profile', async () => {
    const user = await createTestUser();

    const response = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ bio: 'Updated player bio', bgClass: 'bg-purple' });

    expect(response.status).toBe(200);
    expect(response.body.bio).toBe('Updated player bio');
    expect(response.body.bgClass).toBe('bg-purple');
  });

  it('returns the leaderboard ordered by total score with pagination', async () => {
    const lowest = await createTestUser({ username: 'lowest-player', totalScore: 100 });
    const highest = await createTestUser({ username: 'highest-player', totalScore: 900 });
    await createTestUser({ username: 'middle-player', totalScore: 500 });

    const response = await request(app)
      .get('/api/v1/leaderboard')
      .query({ page: 1, limit: 2 });

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({ page: 1, limit: 2 });
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].id).toBe(highest.id);
    expect(response.body.data[1].id).not.toBe(lowest.id);
    expect(response.body.data[0].totalScore).toBeGreaterThan(
      response.body.data[1].totalScore,
    );
  });

  it('normalizes invalid leaderboard pagination values', async () => {
    await createTestUser({ totalScore: 100 });

    const response = await request(app)
      .get('/api/v1/leaderboard')
      .query({ page: 0, limit: 500 });

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({ page: 1, limit: 100 });
  });
});
