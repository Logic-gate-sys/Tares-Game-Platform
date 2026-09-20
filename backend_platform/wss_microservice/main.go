package main

import (
	"flag"
	"fmt"
	"github.com/logic-gate-sys/tares-cli/internals/app"
	"github.com/logic-gate-sys/tares-cli/internals/route"
	"net/http"
	"os"
	"strconv"
	"time"
)

func main() {
	// port value
	var port int
	defaultPort, _ := strconv.Atoi(os.Getenv("WSS_PORT"))
	if defaultPort == 0 {
		defaultPort = 8081
	}
	flag.IntVar(&port, "port", defaultPort, "Backend server port")
	flag.Parse()

	// initialise application
	app, err := app.NewApplication()
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

	fmt.Println("App running on port: ", port)
	err = server.ListenAndServe()
	if err != nil {
		app.Logger.Fatal("Server failed to start properly. Error :", err)
		return
	}
}
