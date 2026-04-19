package observability

import (
	"fmt"
	"sort"
	"strings"
	"sync"
)

type metricsRegistry struct {
	mu                sync.Mutex
	requestsTotal     map[string]int64
	requestErrors     map[string]int64
	requestDurationMS map[string]durationBuckets
	authFailures      map[string]int64
	refreshFailures   int64
	rateLimitedTotal  int64
	dependencyReady   map[string]float64
}

type durationBuckets struct {
	LE100  int64
	LE300  int64
	LE1000 int64
	INF    int64
	SumMS  float64
	Count  int64
}

var global = newRegistry()

func newRegistry() *metricsRegistry {
	return &metricsRegistry{
		requestsTotal:     map[string]int64{},
		requestErrors:     map[string]int64{},
		requestDurationMS: map[string]durationBuckets{},
		authFailures:      map[string]int64{},
		dependencyReady:   map[string]float64{"mysql": 0, "redis": 0},
	}
}

func ObserveRequest(method, route string, statusCode int, durationMS float64) {
	global.observeRequest(method, route, statusCode, durationMS)
}

func IncAuthFailure(reason string) {
	global.mu.Lock()
	defer global.mu.Unlock()
	global.authFailures[clean(reason)] += 1
}

func IncRefreshFailure() {
	global.mu.Lock()
	defer global.mu.Unlock()
	global.refreshFailures += 1
}

func IncRateLimited() {
	global.mu.Lock()
	defer global.mu.Unlock()
	global.rateLimitedTotal += 1
}

func SetDependencyReady(name string, ready bool) {
	global.mu.Lock()
	defer global.mu.Unlock()
	if ready {
		global.dependencyReady[clean(name)] = 1
		return
	}
	global.dependencyReady[clean(name)] = 0
}

func MetricsText() string {
	return global.render()
}

func (m *metricsRegistry) observeRequest(method, route string, statusCode int, durationMS float64) {
	m.mu.Lock()
	defer m.mu.Unlock()

	method = clean(method)
	route = clean(route)
	statusGroup := fmt.Sprintf("%dxx", statusCode/100)
	baseKey := fmt.Sprintf(`method="%s",route="%s"`, method, route)
	requestKey := baseKey + fmt.Sprintf(`,status_group="%s"`, statusGroup)
	m.requestsTotal[requestKey] += 1

	b := m.requestDurationMS[baseKey]
	switch {
	case durationMS <= 100:
		b.LE100 += 1
	case durationMS <= 300:
		b.LE300 += 1
	case durationMS <= 1000:
		b.LE1000 += 1
	default:
		b.INF += 1
	}
	b.SumMS += durationMS
	b.Count += 1
	m.requestDurationMS[baseKey] = b

	if statusCode >= 400 {
		m.requestErrors[requestKey] += 1
	}
}

func (m *metricsRegistry) render() string {
	m.mu.Lock()
	defer m.mu.Unlock()

	lines := []string{
		"# HELP negar_http_requests_total Total HTTP requests.",
		"# TYPE negar_http_requests_total counter",
	}
	lines = append(lines, renderCounterMap("negar_http_requests_total", m.requestsTotal)...)

	lines = append(lines,
		"# HELP negar_http_request_errors_total Total HTTP error responses (4xx/5xx).",
		"# TYPE negar_http_request_errors_total counter",
	)
	lines = append(lines, renderCounterMap("negar_http_request_errors_total", m.requestErrors)...)

	lines = append(lines,
		"# HELP negar_http_request_duration_milliseconds Request duration histogram.",
		"# TYPE negar_http_request_duration_milliseconds histogram",
	)
	lines = append(lines, renderDurationHistogram("negar_http_request_duration_milliseconds", m.requestDurationMS)...)

	lines = append(lines,
		"# HELP negar_auth_failures_total Auth failures by reason.",
		"# TYPE negar_auth_failures_total counter",
	)
	lines = append(lines, renderCounterMap("negar_auth_failures_total", m.authFailures)...)
	lines = append(lines, fmt.Sprintf("negar_refresh_failures_total %d", m.refreshFailures))
	lines = append(lines, fmt.Sprintf("negar_rate_limited_total %d", m.rateLimitedTotal))
	lines = append(lines,
		"# HELP negar_dependency_ready Dependency readiness status: 1=ready,0=not ready.",
		"# TYPE negar_dependency_ready gauge",
	)
	lines = append(lines, renderGaugeMap("negar_dependency_ready", m.dependencyReady)...)
	return strings.Join(lines, "\n") + "\n"
}

func renderCounterMap(metric string, values map[string]int64) []string {
	keys := make([]string, 0, len(values))
	for k := range values {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	lines := make([]string, 0, len(keys))
	for _, k := range keys {
		lines = append(lines, fmt.Sprintf("%s{%s} %d", metric, k, values[k]))
	}
	return lines
}

func renderGaugeMap(metric string, values map[string]float64) []string {
	keys := make([]string, 0, len(values))
	for k := range values {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	lines := make([]string, 0, len(keys))
	for _, k := range keys {
		lines = append(lines, fmt.Sprintf(`%s{name="%s"} %.0f`, metric, k, values[k]))
	}
	return lines
}

func renderDurationHistogram(metric string, values map[string]durationBuckets) []string {
	keys := make([]string, 0, len(values))
	for k := range values {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	lines := make([]string, 0, len(keys)*6)
	for _, k := range keys {
		b := values[k]
		parts := strings.Split(k, ",")
		lines = append(lines, fmt.Sprintf(`%s_bucket{%s,le="100"} %d`, metric, k, b.LE100))
		lines = append(lines, fmt.Sprintf(`%s_bucket{%s,le="300"} %d`, metric, k, b.LE100+b.LE300))
		lines = append(lines, fmt.Sprintf(`%s_bucket{%s,le="1000"} %d`, metric, k, b.LE100+b.LE300+b.LE1000))
		lines = append(lines, fmt.Sprintf(`%s_bucket{%s,le="+Inf"} %d`, metric, k, b.Count))
		lines = append(lines, fmt.Sprintf("%s_sum{%s} %.2f", metric, strings.Join(parts, ","), b.SumMS))
		lines = append(lines, fmt.Sprintf("%s_count{%s} %d", metric, strings.Join(parts, ","), b.Count))
	}
	return lines
}

func clean(v string) string {
	v = strings.TrimSpace(v)
	v = strings.ReplaceAll(v, `"`, `'`)
	if v == "" {
		return "unknown"
	}
	return v
}
