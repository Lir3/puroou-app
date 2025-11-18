package src

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// メモ入力フォーム
type MemoForm struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

// メモ操作ルーティング
func RegisterMemoRoutes(router *gin.Engine) {
	// メモ取得
	router.GET("/api/memos", func(c *gin.Context) {
		userID, _ := c.Get("user_id")
		var memos []Memo
		if err := DB.Where("user_id = ?", userID).Order("created_at desc").Find(&memos).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, memos)
	})

	// メモ登録
	router.POST("/api/memos", func(c *gin.Context) {
		userID, _ := c.Get("user_id")
		var form MemoForm
		c.ShouldBindJSON(&form)
		memo := Memo{
			UserID:    userID.(string),
			Title:     form.Title,
			Content:   form.Content,
			CreatedAt: time.Now(),
		}
		if err := DB.Create(&memo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, memo)
	})

	// メモ更新
	router.PUT("/api/memos/:id", func(c *gin.Context) {
		userID, _ := c.Get("user_id")
		id, _ := strconv.Atoi(c.Param("id"))
		var memo Memo
		if err := DB.Where("id = ? AND user_id = ?", id, userID).First(&memo).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Memo not found"})
			return
		}
		var form MemoForm
		c.ShouldBindJSON(&form)
		memo.Title = form.Title
		memo.Content = form.Content
		if err := DB.Save(&memo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, memo)
	})

	// メモ削除
	router.DELETE("/api/memos/:id", func(c *gin.Context) {
		userID, _ := c.Get("user_id")
		id, _ := strconv.Atoi(c.Param("id"))
		var memo Memo
		if err := DB.Where("id = ? AND user_id = ?", id, userID).First(&memo).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Memo not found"})
			return
		}
		if err := DB.Delete(&memo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": id})
	})
}
