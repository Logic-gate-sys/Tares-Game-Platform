package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type userStats struct {
	Wins     int     `json:"wins"`
	Accuracy float64 `json:"accuracy"`
}

func loadUserStats(ctx context.Context, baseURL string, userID int) (userStats, error) {
	url := strings.TrimRight(baseURL, "/") + "/api/v1/users/" + strconv.Itoa(userID)
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return userStats{}, err
	}

	client := &http.Client{Timeout: 3 * time.Second}
	response, err := client.Do(request)
	if err != nil {
		return userStats{}, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return userStats{}, fmt.Errorf("user service returned %s", response.Status)
	}

	var stats userStats
	if err := json.NewDecoder(response.Body).Decode(&stats); err != nil {
		return userStats{}, err
	}
	return stats, nil
}
