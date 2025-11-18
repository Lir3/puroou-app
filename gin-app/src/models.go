package src

import (
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB初期化（TiDB接続）
var DB *gorm.DB

func InitDB() error {
	var err error
	DB, err = gorm.Open(mysql.Open(Config.TiDBURI), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return err
	}
	return nil
	// マイグレーション実行時は以下でテーブル作成(Memoモデルの定義を詳細化する必要あり)
	// return DB.AutoMigrate(&Memo{})
}

// Memoモデル
type Memo struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    string    `json:"user_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}
