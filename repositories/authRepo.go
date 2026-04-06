package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type authRepo struct{ client *redis.Client }

func NewAuthRepo(client *redis.Client) AuthRepository { return &authRepo{client: client} }

func (r *authRepo) SetRefreshToken(ctx context.Context, tokenID, userID string, ttlSeconds int64) error {
	return r.client.Set(ctx, fmt.Sprintf("refresh:%s", tokenID), userID, time.Duration(ttlSeconds)*time.Second).Err()
}
func (r *authRepo) GetRefreshTokenUser(ctx context.Context, tokenID string) (string, error) {
	return r.client.Get(ctx, fmt.Sprintf("refresh:%s", tokenID)).Result()
}
func (r *authRepo) DeleteRefreshToken(ctx context.Context, tokenID string) error {
	return r.client.Del(ctx, fmt.Sprintf("refresh:%s", tokenID)).Err()
}
func (r *authRepo) CheckRateLimit(ctx context.Context, key string, max int64, windowSeconds int64) (bool, error) {
	current, err := r.client.Incr(ctx, key).Result()
	if err != nil {
		return false, err
	}
	if current == 1 {
		if err = r.client.Expire(ctx, key, time.Duration(windowSeconds)*time.Second).Err(); err != nil {
			return false, err
		}
	}
	return current <= max, nil
}
