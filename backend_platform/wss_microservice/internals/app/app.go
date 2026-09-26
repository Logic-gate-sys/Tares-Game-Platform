package app

import (
	"database/sql"
	"github.com/logic-gate-sys/tares-cli/internals/api"
	"github.com/logic-gate-sys/tares-cli/internals/middleware"
	"github.com/logic-gate-sys/tares-cli/internals/migrations"
	"github.com/logic-gate-sys/tares-cli/internals/store"
	"log"
	"net/http"
	"os"
)

type Application struct {
	Logger      *log.Logger
	DB          *sql.DB
	RoomHandler *api.RoomHandler
	Middleware  middleware.UserMiddleware
	RoomManager interface {
		HandleWS(http.ResponseWriter, *http.Request)
	}
}

func NewApplication() (*Application, error) {
	//logger
	logger := log.New(os.Stdout, " ", log.Ldate|log.Ltime)
	db, err := store.Open()

	if err != nil {
		return nil, err
	}
	roomStore := store.NewPostgresRoomStore(db)
	// migrate database
	err = store.MigrateFS(db, migrations.FS, ".")
	if err != nil {
		db.Close()
		return nil, err
	}
	// all handlers
	roomHandler := api.NewRoomHandler(roomStore, logger)
	authMiddleware, err := middleware.NewUserMiddleware()
	if err != nil {
		return nil, err
	}

	//application
	app := &Application{
		Logger:      logger,
		DB:          db,
		RoomHandler: roomHandler,
		Middleware:  *authMiddleware,
	}
	return app, nil
}
