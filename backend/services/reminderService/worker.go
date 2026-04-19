package reminderService

import (
	"context"
	"time"

	"go.uber.org/zap"
)

type Worker struct {
	service  *Service
	logger   *zap.Logger
	interval time.Duration
	cancel   context.CancelFunc
	done     chan struct{}
}

func NewWorker(service *Service, logger *zap.Logger, interval time.Duration) *Worker {
	if interval <= 0 {
		interval = time.Minute
	}
	return &Worker{service: service, logger: logger, interval: interval, done: make(chan struct{})}
}

func (w *Worker) Start(parent context.Context) {
	if w.service == nil {
		w.logger.Warn("reminder_worker_disabled")
		close(w.done)
		return
	}
	ctx, cancel := context.WithCancel(parent)
	w.cancel = cancel
	go func() {
		defer close(w.done)
		ticker := time.NewTicker(w.interval)
		defer ticker.Stop()
		w.service.Tick(ctx, time.Now().UTC())
		for {
			select {
			case <-ctx.Done():
				return
			case t := <-ticker.C:
				w.service.Tick(ctx, t.UTC())
			}
		}
	}()
}

func (w *Worker) Stop(timeout time.Duration) {
	if w.cancel != nil {
		w.cancel()
	}
	if timeout <= 0 {
		timeout = 3 * time.Second
	}
	select {
	case <-w.done:
	case <-time.After(timeout):
		w.logger.Warn("reminder_worker_stop_timeout")
	}
}
