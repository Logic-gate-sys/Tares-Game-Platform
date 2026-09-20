package middleware

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/logic-gate-sys/tares-cli/internals/utils"
)

type AuthUser struct {
	ID          int
	Email       string
	Username    string
	PlayerLevel string
}

type UserMiddleware struct {
	secret []byte
}

type userKey string

const contextUserKey userKey = "user"

func NewUserMiddleware() (*UserMiddleware, error) {
	secret := os.Getenv("AUTH_SECRET")
	if len(secret) < 32 {
		return nil, errors.New("AUTH_SECRET must contain at least 32 characters")
	}
	return &UserMiddleware{secret: []byte(secret)}, nil
}

func SetUser(r *http.Request, user *AuthUser) *http.Request {
	return r.WithContext(context.WithValue(r.Context(), contextUserKey, user))
}

func GetUser(r *http.Request) *AuthUser {
	user, _ := r.Context().Value(contextUserKey).(*AuthUser)
	return user
}

func (um *UserMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, ok := bearerOrQueryToken(r)
		if !ok {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.Envlope{"error": "Authorization is required"})
			return
		}
		user, err := um.verify(token)
		if err != nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.Envlope{"error": "Invalid or expired token"})
			return
		}
		next.ServeHTTP(w, SetUser(r, user))
	})
}

func (um *UserMiddleware) RequireAuth(next http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if GetUser(r) == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.Envlope{"error": "Authorization is required"})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func bearerOrQueryToken(r *http.Request) (string, bool) {
	if header := r.Header.Get("Authorization"); header != "" {
		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" || parts[1] == "" {
			return "", false
		}
		return parts[1], true
	}
	token := r.URL.Query().Get("token")
	return token, token != ""
}

func (um *UserMiddleware) verify(token string) (*AuthUser, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return nil, errors.New("invalid token")
	}
	signature, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, err
	}
	mac := hmac.New(sha256.New, um.secret)
	_, _ = mac.Write([]byte(parts[0]))
	if !hmac.Equal(signature, mac.Sum(nil)) {
		return nil, errors.New("invalid signature")
	}
	body, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return nil, err
	}
	var claims struct {
		Sub       string `json:"sub"`
		Email     string `json:"email"`
		Username  string `json:"username"`
		PLevel    string `json:"pLevel"`
		ExpiresAt int64  `json:"exp"`
	}
	if err := json.Unmarshal(body, &claims); err != nil {
		return nil, err
	}
	id, err := strconv.Atoi(claims.Sub)
	if err != nil || id <= 0 || claims.ExpiresAt < time.Now().Unix() {
		return nil, errors.New("invalid claims")
	}
	return &AuthUser{ID: id, Email: claims.Email, Username: claims.Username, PlayerLevel: claims.PLevel}, nil
}
