package middleware

import (
	"context"
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"github.com/logic-gate-sys/tares-cli/internals/utils"
	"net/http"
	"os"
	"strconv"
	"strings"
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

func (um *UserMiddleware) RequireAuth(next http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if GetUser(r) == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.Envlope{"error": "Authorization is required"})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (um *UserMiddleware) verify(token string) (*AuthUser, error) {
	parsed, err := jwt.Parse(token, func(parsed *jwt.Token) (any, error) {
		if parsed.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("unexpected signing method")
		}
		return um.secret, nil
	})
	if err != nil || !parsed.Valid {
		return nil, errors.New("invalid or expired token")
	}

	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}
	sub, ok := claims["sub"].(string)
	if !ok || sub == "" {
		return nil, errors.New("invalid token subject")
	}
	email, emailOK := claims["email"].(string)
	username, usernameOK := claims["username"].(string)
	playerLevel, levelOK := claims["pLevel"].(string)
	if !emailOK || !usernameOK || !levelOK {
		return nil, errors.New("invalid token claims")
	}

	id, err := strconv.Atoi(sub)
	if err != nil || id <= 0 {
		return nil, errors.New("invalid token subject")
	}
	return &AuthUser{ID: id, Email: email, Username: username, PlayerLevel: playerLevel}, nil
}
