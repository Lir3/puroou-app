package src

import (
	"log"
	"net/http"
	"regexp"
	"slices"
	"strings"

	"github.com/gin-gonic/gin"
)

// 認証不要パスの定義
var authIgnorePatterns = []*regexp.Regexp{
	regexp.MustCompile(`^/$`),
	regexp.MustCompile(`^/favicon\.ico$`),
	regexp.MustCompile(`^/api/auth/`),
	regexp.MustCompile(`\.html$`),
	regexp.MustCompile(`\.css$`),
	regexp.MustCompile(`\.js$`),
}

// 認証不要パス判定
func isAuthIgnored(path string) bool {
	return slices.ContainsFunc(authIgnorePatterns, func(reg *regexp.Regexp) bool {
		return reg.MatchString(path)
	})
}

// 認証ミドルウェア
func SupabaseAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// リクエストパスの認証不要判定
		if isAuthIgnored(c.Request.URL.Path) {
			c.Next()
			return
		}

		// Authorizationヘッダーの取得
		authHeader := c.GetHeader("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			log.Println("Missing or invalid Authorization header")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Supabase認証
		userResult, status := GetUserByAccessToken(authHeader[7:])
		if userResult["id"] == nil {
			log.Printf("Status: %d, Message: %v", status, userResult["error"])
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// ユーザーIDをコンテキストにセット
		c.Set("user_id", userResult["id"])
		c.Next()
	}
}
