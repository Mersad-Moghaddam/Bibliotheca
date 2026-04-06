package repositories

type monitoringRepo struct{}

func NewMonitoringRepo() MonitoringRepository { return &monitoringRepo{} }
