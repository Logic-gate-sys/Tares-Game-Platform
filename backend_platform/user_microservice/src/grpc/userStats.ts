import { viewUserProfile } from '../repositories/users.ts';
import * as grpc from '@grpc/grpc-js'


export async function getUserStats(call, callback) {
  try {
    const userId = call.request.user_id;
    const user = await viewUserProfile(userId);
    if (!user) {
      callback(null, { error: 'Not found' });
    }
    const stats = {
      id: user?.id,
      name: user?.username,
      level: user?.playerLevel,
      rank: user?.rank,
      stats: {
        wins: user?.wins,
        accuracy: user?.accuracy
      }
    }
    callback(null, stats);
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      error: error?.message?? 'unkown error',
      message: 'Failed to retrieve user stats',
    });
  }
}
