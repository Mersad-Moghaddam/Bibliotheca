package repositories

type requestLimiterRepo struct{}

func NewRequestLimiterRepo() RequestLimiterRepository { return &requestLimiterRepo{} }
