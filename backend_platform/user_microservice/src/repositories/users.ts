import { desc, eq, or } from 'drizzle-orm';
import { db } from '#config/database';
import { Users } from '#db/schema';
import type {PasswordResetRequestInput,SigninInput,SignupData} from '#schemas/auth';
import { hashPassword, verifyPassword } from '#utils/crypto';



export type StoredUser = typeof Users.$inferSelect;

export async function signUp(data: SignupData): Promise<StoredUser | undefined> {
  const existing = await db
    .select({ id: Users.id })
    .from(Users)
    .where(or(eq(Users.email, data.email), eq(Users.username, data.username)))
    .limit(1);

  if (existing.length > 0) {
    return undefined;
  }

  const [user] = await db
    .insert(Users)
    .values({
      email: data.email,
      username: data.username,
      password: hashPassword(data.password),
      playerLevel: data.playerLevel ?? '1',
      rank: data.rank ?? 'unranked',
      bio: data.bio ?? '',
      totalScore: 0,
      avatarUrl: data.avatarUrl,
      bgClass: data.bgClass ?? '',
    })
    .returning();

  return user;
}

export async function signIn(data: SigninInput): Promise<StoredUser | undefined> {
  const [user] = await db
    .select()
    .from(Users)
    .where(data.email ? eq(Users.email, data.email) : eq(Users.username, data.username!))
    .limit(1);

  if (!user || !verifyPassword(data.password, user.password)) {
    return undefined;
  }

  return user;
}

export async function updateUser(
  userId: number,
  data: { username?: string; bio?: string; avatarUrl?: string; bgClass?: string },
): Promise<StoredUser | undefined> {
  const [user] = await db.update(Users).set(data).where(eq(Users.id, userId)).returning();
  return user;
}

export async function findUserById(userId: number): Promise<StoredUser | undefined> {
  return viewUserProfile(userId);
}

export async function findUserByUsername(username: string): Promise<StoredUser | undefined> {
  const [user] = await db.select().from(Users).where(eq(Users.username, username)).limit(1);
  return user;
}

export async function listUsers(
  limit: number,
  offset: number,
): Promise<StoredUser[]> {
  return db.select().from(Users).orderBy(desc(Users.totalScore)).limit(limit).offset(offset);
}

export async function resetPassword(data: PasswordResetRequestInput): Promise<StoredUser | undefined> {
  const [user] = await db
    .select()
    .from(Users)
    .where(eq(Users.email, data.email))
    .limit(1);

  return user;
}

export async function resetPassoword( data: PasswordResetRequestInput): Promise<StoredUser | undefined> {
  return resetPassword(data);
}

export async function confirmPasswordReset(userId: number,password: string): Promise<StoredUser | undefined> {
  const [user] = await db
    .update(Users)
    .set({ password: hashPassword(password) })
    .where(eq(Users.id, userId))
    .returning();

  return user;
}

export async function viewUserProfile(userId: number): Promise<StoredUser | undefined> {
  const [user] = await db
    .select()
    .from(Users)
    .where(eq(Users.id, userId))
    .limit(1);

  return user;
}
