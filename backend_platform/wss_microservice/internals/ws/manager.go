package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/internals/events"
	"github.com/logic-gate-sys/tares-cli/internals/middleware"
	"github.com/logic-gate-sys/tares-cli/internals/store"
)

type LobbyAction struct {
	Client *client
	Action events.InlobbyUserAction
}

type roomManager struct {
	sync.RWMutex
	rooms        map[string]*PlayerRoom // map of all rooms in this manager
	lobbyClients map[*client]bool       // all clients with no rooms yet
	lobbyLeave   chan *client
	lobbyJoin    chan *client // client with no room joins room manaer through this
	lobbyInbound chan LobbyAction
	roomStore    *store.PostGresRoomStore
	runOnce      sync.Once
}

func NewRoomManager(roomStore *store.PostGresRoomStore) *roomManager {
	return &roomManager{
		rooms:        make(map[string]*PlayerRoom),
		lobbyClients: make(map[*client]bool),
		lobbyJoin:    make(chan *client),
		lobbyLeave:   make(chan *client),
		lobbyInbound: make(chan LobbyAction),
		roomStore:    roomStore,
	}
}

// manages lobby state(joining, leaving, discovering rooms)
func (rm *roomManager) Run() {
	// the loop
	for {
		select {
		// when client joins lobby channel
		case client := <-rm.lobbyJoin:
			rm.lobbyClients[client] = true
			// also search for all rooms in lobby give client results
			ctx := context.Background()
			rooms, err := rm.roomStore.GetAllRooms(ctx)
			if err != nil {
				return
			}
			client.inLobbyToClientEvent <- events.LobbyStateBroadcast{
				Which:   events.AvailableRooms,
				Data:    rooms,
				Message: "Current online rooms available",
			}
			log.Printf("Client: %s joined lobby", client.name)

		// TODO: Find a way to ensure room owner client is last to leave lobby(
		// this client need to accepts others into his room/ start , initial game)
		case client := <-rm.lobbyLeave:
			delete(rm.lobbyClients, client)
			close(client.inLobbyToClientEvent)
			log.Printf("Client: %s left lobby", client.name)

		// if an event is sent to lobby
		case action := <-rm.lobbyInbound:
			switch action.Action.Action {
			case events.CreateRoom:
				{
					var payload struct {
						Name string `json:"name"`
					}
					err := json.Unmarshal(action.Action.Value, &payload)
					// if room id is not valid
					if payload.Name == "" {
						break
					}
					ctx := context.Background()
					room, err := rm.roomStore.GetRoomByName(ctx, payload.Name)
					if err != nil {
						log.Println("Error(wss): ", err.Error())
						break
					}

					log.Printf("Room to clients: %v", room)
					for client, _ := range rm.lobbyClients {
						client.inLobbyToClientEvent <- events.LobbyStateBroadcast{
							Which:   events.NewRoom,
							Data:    room,
							Message: "New room created",
						}
					}
				}

			// when a user updates their room;
			case events.UpdateRoom:
				{
					var payload struct {
						Name string `json:"name"`
					}
					err := json.Unmarshal(action.Action.Value, &payload)
					// if room id is not valid
					if payload.Name == "" {
						break
					}
					ctx := context.Background()
					room, err := rm.roomStore.GetRoomByName(ctx, payload.Name)
					if err != nil {
						log.Println("Error(wss): ", err.Error())
						break
					}

					log.Printf("(updated)Room to clients: %v", room)
					for client, _ := range rm.lobbyClients {
						client.inLobbyToClientEvent <- events.LobbyStateBroadcast{
							Which:   events.UpdatedRoom,
							Data:    room,
							Message: "Updated room",
						}
					}
				}

				// incase user wants to join an available room
				// TODO: Sent message to room owner of the join request
				// wait for the owner to resolve request or fail request after x-minutes waiting

			// when room join request is sent
			case events.JoinRoom:
				// payload struct
				var payload struct {
					RoomId string `json:"roomId"`
					Name   string `json:"playerName"`
					Level  string `json:"playerLevel"`
				}
				if err := json.Unmarshal(action.Action.Value, &payload); err != nil {
					log.Printf("Failed unmarshall payload. Error: %v", err)
					break
				}
				room, err := rm.roomStore.GetRoomById(context.Background(), payload.RoomId)
				if err != nil {
					log.Println("Error(wss): ", err.Error())
					break
				}

				// formated pertion
				petition := events.PetitionRequest{
					ID:             uuid.New().String(),
					PetitionNumber: fmt.Sprintf("Req:%s", uuid.New()),
					CreatedAt:      time.Now(),
					PlayerName:     payload.Name,
					PlayerLevel:    payload.Level,
					// TODO: Find actual scores instead of place-holders
					Stats: &events.PetitionStats{
						Wins:     30,
						Accuracy: 89,
						Ping:     400,
					},
				}

				// notifier room owner of request
				for client, _ := range rm.lobbyClients {
					ownerID, parseErr := strconv.Atoi(room.OwnerId)
					if parseErr == nil && client.userId == ownerID {
						client.inLobbyToClientEvent <- events.LobbyStateBroadcast{
							Which:   events.IncomingJoinRequest,
							Data:    petition,
							Message: "A player is requesting to join your room",
						}
						break
					}
				}
			}
		}
	}
}

var (
	socketBufferSize  = 1024 // 1kb
	messageBufferSize = 1024 // 1kb
)
var upgrader = &websocket.Upgrader{
	ReadBufferSize:  socketBufferSize,
	WriteBufferSize: socketBufferSize,
	CheckOrigin:     func(r *http.Request) bool { return true }, // CORS
}

// upgrade http request into a websocket connection
func (rm *roomManager) HandleWS(w http.ResponseWriter, r *http.Request) {
	// get authenticated user
	user := middleware.GetUser(r)
	// upgrade http request
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic("Socket upgrade failed ")
	}
	// Create client from authenticated user
	client := &client{
		name:                 user.Username,
		userId:               user.ID,
		socket:               socket,
		inLobbyToClientEvent: make(chan events.LobbyStateBroadcast),
		manager:              rm,
	}
	// run room & put client on lobbyJoin chan
	rm.runOnce.Do(func() { go rm.Run() })
	rm.lobbyJoin <- client

	// start client read & write pumps
	go client.writeToClientPump()
	go client.readFromClientPump()
}
