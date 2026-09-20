import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  hashPassword: vi.fn((password: string) => `hashed:${password}`),
  verifyPassword: vi.fn(),
}));

vi.mock('#config/database', () => ({
  db: {
    select: mocks.select,
    insert: mocks.insert,
    update: mocks.update,
  },
}));

vi.mock('#utils/crypto', () => ({
  hashPassword: mocks.hashPassword,
  verifyPassword: mocks.verifyPassword,
}));

const {
  confirmPasswordReset,
  resetPassword,
  signIn,
  signUp,
  viewUserProfile,
} = await import('#repositories/users');

const user = {
  id: 7,
  email: 'alice@example.com',
  username: 'alice',
  password: 'hashed:password123',
  playerLevel: '1',
  rank: 'unranked',
  bio: 'Test user',
  bgClass: 'default',
  avatar: null,
  avatarUrl: 'https://res.cloudinary.com/test/avatar.jpg',
  totalScore: 0,
  createdAt: new Date(),
};

function selectResult(rows: unknown[]) {
  mocks.select.mockReturnValue({
    from: () => ({
      where: () => ({
        limit: vi.fn().mockResolvedValue(rows),
      }),
    }),
  });
}

describe('users repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not create a duplicate user', async () => {
    selectResult([{ id: user.id }]);

    await expect(signUp({
      email: user.email,
      username: user.username,
      password: 'password123',
      playerLevel: '1',
      rank: 'unranked',
      bio: 'Test user',
      bgClass: 'default',
      avatarUrl: user.avatarUrl,
    })).resolves.toBeUndefined();

    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('creates a user with a hashed password', async () => {
    selectResult([]);
    mocks.insert.mockReturnValue({
      values: (values: unknown) => {
        expect(values).toMatchObject({
          email: user.email,
          username: user.username,
          password: 'hashed:password123',
        });
        return {
          returning: vi.fn().mockResolvedValue([user]),
        };
      },
    });

    await expect(signUp({
      email: user.email,
      username: user.username,
      password: 'password123',
      playerLevel: '1',
      rank: 'unranked',
      bio: 'Test user',
      bgClass: 'default',
      avatarUrl: user.avatarUrl,
    })).resolves.toEqual(user);
    expect(mocks.hashPassword).toHaveBeenCalledWith('password123');
  });

  it('returns a user only when signin credentials are valid', async () => {
    selectResult([user]);
    mocks.verifyPassword.mockReturnValueOnce(true);

    await expect(signIn({
      email: user.email,
      password: 'password123',
    })).resolves.toEqual(user);
    expect(mocks.verifyPassword).toHaveBeenCalledWith('password123', user.password);
  });

  it('returns no user for invalid signin credentials', async () => {
    selectResult([user]);
    mocks.verifyPassword.mockReturnValueOnce(false);

    await expect(signIn({
      email: user.email,
      password: 'wrong-password',
    })).resolves.toBeUndefined();
  });

  it('finds a user for password reset requests', async () => {
    selectResult([user]);

    await expect(resetPassword({ email: user.email })).resolves.toEqual(user);
  });

  it('updates a user password and returns the updated user', async () => {
    mocks.update.mockReturnValue({
      set: (values: unknown) => {
        expect(values).toEqual({ password: 'hashed:new-password' });
        return {
          where: () => ({
            returning: vi.fn().mockResolvedValue([user]),
          }),
        };
      },
    });

    await expect(confirmPasswordReset(user.id, 'new-password')).resolves.toEqual(user);
  });

  it('loads a user profile by id', async () => {
    selectResult([user]);

    await expect(viewUserProfile(user.id)).resolves.toEqual(user);
  });
});
