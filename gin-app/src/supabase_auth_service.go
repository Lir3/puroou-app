package src

import (
	"encoding/json"
	"fmt"

	"github.com/go-resty/resty/v2"
)

// APIリクエスト処理
func apiRequest(method, path string, data interface{}, accessToken string) (map[string]interface{}, int) {

	client := resty.New().
		SetHeader("apikey", Config.SupabaseAnonKey).
		SetHeader("Content-Type", "application/json")

	request := client.R()
	if accessToken != "" {
		request.SetHeader("Authorization", "Bearer "+accessToken)
	}
	if data != nil {
		request.SetBody(data)
	}
	url := Config.SupabaseURL + path

	response, err := request.Execute(method, url)
	if err != nil {
		return map[string]interface{}{"error": fmt.Sprintf("Network error: %v", err)}, 500
	}

	var result map[string]interface{}
	json.Unmarshal(response.Body(), &result)

	return result, response.StatusCode()
}

// サインアップ（メール・パスワード）
func Signup(email, password, redirectTo string) (map[string]interface{}, int) {
	data := map[string]interface{}{
		"email":    email,
		"password": password,
		"options": map[string]interface{}{
			"email_redirect_to": redirectTo,
		},
	}
	return apiRequest("POST", "/auth/v1/signup", data, "")
}

// ログイン（メール・パスワード）
func LoginWithPassword(email, password string) (map[string]interface{}, int) {
	data := map[string]interface{}{
		"email":    email,
		"password": password,
	}
	return apiRequest("POST", "/auth/v1/token?grant_type=password", data, "")
}

// ユーザ情報取得
func GetUserByAccessToken(accessToken string) (map[string]interface{}, int) {
	return apiRequest("GET", "/auth/v1/user", nil, accessToken)
}

// ログアウト
func Logout(accessToken string) (map[string]interface{}, int) {
	return apiRequest("POST", "/auth/v1/logout", nil, accessToken)
}

// GitHub認証用URL取得
func GetGithubSigninURL(redirectTo string) string {
	return fmt.Sprintf("%s/auth/v1/authorize?provider=github&redirect_to=%s&scopes=user:email", Config.SupabaseURL, redirectTo)
}
