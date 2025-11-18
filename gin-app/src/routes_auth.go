package src

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 認証フォーム
type AuthForm struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// baseHostUrlの作成
func baseHostURL(c *gin.Context) string {
	host := c.GetHeader("X-Forwarded-Host")
	if host == "" {
		host = c.Request.Host
	}
	scheme := c.GetHeader("X-Forwarded-Proto")
	if scheme == "" {
		if c.Request.TLS != nil {
			scheme = "https"
		} else {
			scheme = "http"
		}
	}
	log.Printf("base_host_url host=%s scheme=%s", host, scheme)
	return fmt.Sprintf("%s://%s/", scheme, host)
}

// 認証ルーティングを登録する関数
func RegisterAuthRoutes(router *gin.Engine) {
	// アカウント登録
	router.POST("/api/auth/register", func(c *gin.Context) {
		var form AuthForm
		c.ShouldBindJSON(&form)
		redirectTo := baseHostURL(c)
		result, _ := Signup(form.Email, form.Password, redirectTo)
		if result["id"] != nil {
			c.JSON(http.StatusOK, gin.H{"message": "Registration successful. Please check your email for confirmation."})
			return
		}
		c.JSON(http.StatusBadRequest, result)
	})

	// 認証ユーザ情報取得
	router.GET("/api/auth/user", func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		result, status := GetUserByAccessToken(authHeader[7:])
		c.JSON(status, gin.H{"email": result["email"]})
	})

	// ログイン
	router.POST("/api/auth/login", func(c *gin.Context) {
		var form AuthForm
		c.ShouldBindJSON(&form)
		result, status := LoginWithPassword(form.Email, form.Password)
		c.JSON(status, result)
	})

	// ログアウト
	router.POST("/api/auth/logout", func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		Logout(authHeader[7:])
		c.JSON(http.StatusOK, gin.H{"message": "Logout successful."})
	})

	// GitHub認証リダイレクト
	router.GET("/api/auth/oauth2/github", func(c *gin.Context) {
		redirectTo := baseHostURL(c)
		githubURL := GetGithubSigninURL(redirectTo)
		c.Redirect(http.StatusFound, githubURL)
	})
}
