package store

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type Status string

const (
	Waiting  Status = "waiting"
	Playing  Status = "playing"
	Finished Status = "online"
	Idle     Status = "offline"
)

type CreateRoom struct {
	Id                 string    `json:"id"`
	OwnerId            int       `json:"ownerId"`
	Name               string    `json:"name"`
	Capacity           int       `json:"capacity"`
	Status             Status    `json:"status"`
	Icon               string    `json:"icon"`
	IconBgClass        string    `json:"iconBgClass"`
	IconTextColorClass string    `json:"iconTextColorClass"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

type RoomViewModel struct {
	ID                 string `json:"id"`
	OwnerId            string `json:"ownerId"`
	Name               string `json:"name"`
	Capacity           int    `json:"capacity"`
	Status             string `json:"status"`
	Icon               string `json:"icon"`
	IconBgClass        string `json:"iconBgClass"`
	IconTextColorClass string `json:"iconTextColorClass"`
	Players            int    `json:"players"`
	PlayersText        string `json:"playersText"`
	TimeLeftText       string `json:"timeLeftText"`
	Avatars            []any  `json:"avatars"`
	ExtraPlayersCount  int    `json:"extraPlayersCount"`
}

type RoomUpdateType struct {
	OwnerId  int    `json:"-"`
	Name     string `json:"name"`
	Capacity int    `json:"capacity"`
	Icon     string `json:"icon"`
	Status   string `json:"status"`
}

type PostGresRoomStore struct {
	db *sql.DB
}

func NewPostgresRoomStore(db *sql.DB) *PostGresRoomStore {
	return &PostGresRoomStore{db: db}
}

func (pr *PostGresRoomStore) CreateRoom(rm *CreateRoom, ctx context.Context) (CreateRoom, error) {
	const query = `
		INSERT INTO rooms (owner_id, name, capacity, status, icon, icon_bg_class, icon_text_color_class)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, owner_id, name, capacity, status, icon, icon_bg_class, icon_text_color_class, created_at, updated_at`

	var created CreateRoom
	err := pr.db.QueryRowContext(ctx, query, rm.OwnerId, rm.Name, rm.Capacity, rm.Status, rm.Icon, rm.IconBgClass, rm.IconTextColorClass).
		Scan(&created.Id, &created.OwnerId, &created.Name, &created.Capacity, &created.Status, &created.Icon,
			&created.IconBgClass, &created.IconTextColorClass, &created.CreatedAt, &created.UpdatedAt)
	return created, err
}

func (pr *PostGresRoomStore) GetAllRooms(ctx context.Context) ([]RoomViewModel, error) {
	const query = `
		SELECT r.id::text, r.owner_id::text, r.name, r.capacity, r.status, r.icon,
		       r.icon_bg_class, r.icon_text_color_class, COUNT(rp.user_id)::int,
		       GREATEST(0, COUNT(rp.user_id)::int - 3)
		FROM rooms r
		LEFT JOIN room_players rp ON r.id = rp.room_id
		GROUP BY r.id
		ORDER BY r.created_at DESC`

	rows, err := pr.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rooms := make([]RoomViewModel, 0)
	for rows.Next() {
		var room RoomViewModel
		if err := rows.Scan(&room.ID, &room.OwnerId, &room.Name, &room.Capacity, &room.Status, &room.Icon,
			&room.IconBgClass, &room.IconTextColorClass, &room.Players, &room.ExtraPlayersCount); err != nil {
			return nil, err
		}
		room.PlayersText = formatPlayers(room.Players)
		room.Avatars = []any{}
		rooms = append(rooms, room)
	}
	return rooms, rows.Err()
}

func (pr *PostGresRoomStore) GetRoomByName(ctx context.Context, name string) (RoomViewModel, error) {
	return pr.getRoom(ctx, `WHERE r.name = $1`, name)
}

func (pr *PostGresRoomStore) GetRoomById(ctx context.Context, id string) (RoomViewModel, error) {
	return pr.getRoom(ctx, `WHERE r.id = $1`, id)
}

func (pr *PostGresRoomStore) getRoom(ctx context.Context, predicate string, arg string) (RoomViewModel, error) {
	query := fmt.Sprintf(`
		SELECT r.id::text, r.owner_id::text, r.name, r.capacity, r.status, r.icon,
		       r.icon_bg_class, r.icon_text_color_class, COUNT(rp.user_id)::int,
		       GREATEST(0, COUNT(rp.user_id)::int - 3)
		FROM rooms r
		LEFT JOIN room_players rp ON r.id = rp.room_id
		%s
		GROUP BY r.id
		ORDER BY r.created_at DESC`, predicate)

	var room RoomViewModel
	err := pr.db.QueryRowContext(ctx, query, arg).Scan(&room.ID, &room.OwnerId, &room.Name, &room.Capacity, &room.Status,
		&room.Icon, &room.IconBgClass, &room.IconTextColorClass, &room.Players, &room.ExtraPlayersCount)
	if err != nil {
		return RoomViewModel{}, err
	}
	room.PlayersText = formatPlayers(room.Players)
	room.Avatars = []any{}
	return room, nil
}

func (pr *PostGresRoomStore) DeleteRoom(ctx context.Context, id string) (bool, error) {
	result, err := pr.db.ExecContext(ctx, `DELETE FROM rooms WHERE id = $1`, id)
	if err != nil {
		return false, err
	}
	count, err := result.RowsAffected()
	return count > 0, err
}

func (pr *PostGresRoomStore) UpdateRoom(ctx context.Context, roomId string, update RoomUpdateType) error {
	const query = `
		UPDATE rooms SET name = $1, capacity = $2, icon = $3, status = $4
		WHERE id = $5 AND owner_id = $6`
	result, err := pr.db.ExecContext(ctx, query, update.Name, update.Capacity, update.Icon, update.Status, roomId, update.OwnerId)
	if err != nil {
		return err
	}
	count, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if count == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func formatPlayers(players int) string {
	return fmt.Sprintf("%d", players)
}
