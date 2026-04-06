package cache

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisStore struct{ client *redis.Client }

func NewRedisStore(client *redis.Client) *RedisStore { return &RedisStore{client: client} }

func (s *RedisStore) SetRefreshToken(ctx context.Context, tokenID, userID string, ttlSeconds int64) error {
	return s.client.Set(ctx, fmt.Sprintf("refresh:%s", tokenID), userID, time.Duration(ttlSeconds)*time.Second).Err()
}
func (s *RedisStore) GetRefreshTokenUser(ctx context.Context, tokenID string) (string, error) {
	return s.client.Get(ctx, fmt.Sprintf("refresh:%s", tokenID)).Result()
}
func (s *RedisStore) DeleteRefreshToken(ctx context.Context, tokenID string) error {
	return s.client.Del(ctx, fmt.Sprintf("refresh:%s", tokenID)).Err()
}
func (s *RedisStore) CheckRateLimit(ctx context.Context, key string, max int64, windowSeconds int64) (bool, error) {
	current, err := s.client.Incr(ctx, key).Result()
	if err != nil {
		return false, err
	}
	if current == 1 {
		if err = s.client.Expire(ctx, key, time.Duration(windowSeconds)*time.Second).Err(); err != nil {
			return false, err
		}
	}
	return current <= max, nil
}
