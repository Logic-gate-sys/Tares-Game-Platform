package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
	"github.com/logic-gate-sys/wss_service/internals/app"
	"github.com/logic-gate-sys/wss_service/internals/grpc"
	"github.com/logic-gate-sys/wss_service/internals/route"
)

func main() {
	 // Fetch gRPC target address from environment variable (default for local dev)
		grpcAddr := os.Getenv("USER_GRPC_ADDR")
		if grpcAddr == "" {
			grpcAddr = "user-service:50051"
		}
		
		grpcClient, err := grpc.NewUserGRPCClient(grpcAddr)
		if err != nil {
			log.Fatalf("Failed to initialize User gRPC client: %v", err)
		}
		defer grpcClient.Close()
	
		log.Printf("Connected to User gRPC Service at %s", grpcAddr)
	// port value
	var port int
	defaultPort, _ := strconv.Atoi(os.Getenv("WSS_PORT"))
	if defaultPort == 0 {
		defaultPort = 8081
	}
	flag.IntVar(&port, "port", defaultPort, "Backend server port")
	flag.Parse()

	// initialise application
	app, err := app.NewApplication(grpcClient)
	if err != nil {
		fmt.Println("Application failed to start")
		return
	}
	// defer db close
	defer app.DB.Close()
	// initialise router
	router := route.SetupRoute(app)
	// initialise server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      router,
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	err = server.ListenAndServe()
	if err != nil {
		app.Logger.Fatal("Server failed to start properly. Error :", err)
		return
	}
	fmt.Println("App running on port: ", port)
}
