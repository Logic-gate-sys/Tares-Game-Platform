package grpc

import (
	"context"
	"fmt"
	"time"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
  pb "github.com/logic-gate-sys/wss_service/pkg/userpb/user/v1"
)

type UserGRPCClient struct {
	client pb.UserServiceClient
	conn   *grpc.ClientConn
}

func NewUserGRPCClient(targetAddr string) (*UserGRPCClient, error) {
	conn, err := grpc.NewClient(targetAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("failed to dial gRPC server at %s: %w", targetAddr, err)
	}

	return &UserGRPCClient{
		client: pb.NewUserServiceClient(conn),
		conn:   conn,
	}, nil
}



func (c *UserGRPCClient) GetUserStats(ctx context.Context, userID int32) (*pb.GetUserStatsResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	req := &pb.GetUserStatsRequest{
		UserId: userID,
	}

	return c.client.GetUserStats(ctx, req)
}

func (c *UserGRPCClient) Close() error {
	return c.conn.Close()
}