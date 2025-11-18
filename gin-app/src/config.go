package src

import (
	"fmt"
	"os"
)

type AppConfig struct {
	ServerPort      string
	SupabaseURL     string
	SupabaseAnonKey string
	TiDBUser        string
	TiDBPassword    string
	TiDBHost        string
	TiDBPort        string
	TiDBDBName      string
	TiDBURI         string
}

// グローバル変数で定義
var Config *AppConfig

func init() {
	Config = newConfig()
}

// newConfig: 環境変数から設定値を取得
func newConfig() *AppConfig {
	config := &AppConfig{
		ServerPort:      "8180",
		SupabaseURL:     getEnv("SUPABASE_URL", ""),
		SupabaseAnonKey: getEnv("SUPABASE_ANON_KEY", ""),
		TiDBUser:        getEnv("TIDB_USER", ""),
		TiDBPassword:    getEnv("TIDB_PASSWORD", ""),
		TiDBHost:        getEnv("TIDB_HOST", ""),
		TiDBPort:        getEnv("TIDB_PORT", ""),
		TiDBDBName:      getEnv("TIDB_DB_NAME", ""),
	}
	config.TiDBURI = fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?tls=true&parseTime=true",
		config.TiDBUser, config.TiDBPassword, config.TiDBHost, config.TiDBPort, config.TiDBDBName,
	)
	return config
}

// getEnv: 環境変数取得（デフォルト値付き）
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
