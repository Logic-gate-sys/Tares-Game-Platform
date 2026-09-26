import * as grpc from '@grpc/grpc-js';
import { getUserStats } from './userStats.ts';
import * as protoLoader from '@grpc/proto-loader';
import path from 'node:path';

// rRPC server setup
const PROTO_PATH = path.resolve(process.cwd(), 'proto/user/v1/user.proto');
// configure grpc
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  oneofs: true,
  longs: String,
  enums: String,
  defaults: true,
})

const proto = (grpc.loadPackageDefinition(packageDef) as any).user.v1;
export function startGrpcServer(port: string): grpc.Server {
  const server = new grpc.Server();
  server.addService(proto.UserService.service, { getUserStats });

  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
      console.error('Failed to bind gRPC server:', err);
      return;
    }
    console.log(`gRPC Server running on port ${boundPort}`);
  });

  return server;
}
