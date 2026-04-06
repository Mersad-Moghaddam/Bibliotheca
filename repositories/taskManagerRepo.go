package repositories

type taskManagerRepo struct{}

func NewTaskManagerRepo() TaskManagerRepository { return &taskManagerRepo{} }
