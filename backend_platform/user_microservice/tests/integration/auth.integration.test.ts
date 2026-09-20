import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app.ts';
import { createTestUser } from '../helpers/testHelpers.ts';

vi.mock('#utils/uploader', () => ({
  upload: vi.fn().mockResolvedValue('https://cdn.test/avatar.jpg'),
}));

describe('Auth integration tests', () => {
  it('registers through the real route without calling Cloudinary', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .field({
        email: 'custom@test.com',
        username: 'custom',
        password: 'Password123!',
        playerLevel: '1',
        rank: 'unranked',
        bio: 'Custom test user',
        bgClass: 'default',
      })
      .attach('avatar', Buffer.from('test-image'), 'avatar.jpg');

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('custom@test.com');
    expect(response.body.user.avatarUrl).toBe('https://cdn.test/avatar.jpg');
    expect(response.body.token).toBeDefined();
  });

  it('rejects duplicate registration', async () => {
    const user = await createTestUser();
    const response = await request(app)
      .post('/api/v1/auth/register')
      .field({
        email: user.email,
        username: 'another-user',
        password: 'Password123!',
      })
      .attach('avatar', Buffer.from('test-image'), 'avatar.jpg');

    expect(response.status).toBe(409);
  });

  it('logs in with email or username', async () => {
    const user = await createTestUser();
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: user.username, password: user.rawPassword });

    expect(response.status).toBe(200);
    expect(response.body.user.username).toBe(user.username);
    expect(response.body.token).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'missing@example.com', password: 'Password123!' });

    expect(response.status).toBe(401);
  });

  it('returns the authenticated profile', async () => {
    const user = await createTestUser();
    const response = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(user.email);
  });

  it('rejects profile access without a token', async () => {
    const response = await request(app).get('/api/v1/users/me');
    expect(response.status).toBe(401);
  });

  it('returns a password reset token and accepts it', async () => {
    const user = await createTestUser();
    const reset = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: user.email });

    expect(reset.status).toBe(200);
    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: reset.body.resetToken, password: 'NewPassword123!' });

    expect(response.status).toBe(200);
  });
});
