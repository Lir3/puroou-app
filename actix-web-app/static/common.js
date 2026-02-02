// --- エラー表示 ---
const showError = (message) => {
    const msg  = message === 'Unauthorized' ? '' : message
    document.getElementById('error-message').textContent = msg;
};

// --- API通信ロジック ---
const apiFetch = async (url, options = {}, accessToken) => {

    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }    
    const response = await fetch(url, { ...options, headers });

    if ([401, 403].includes(response.status)) {
        localStorage.removeItem('user_session');
        alert('認証されてません。再度ログインしてください。。再度ログインしてください。');
        // window.location.href = '/index.html';
        throw new Error('Unauthorized');
    }
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error('APIリクエストに失敗しました. ' + errorData.error);
    }
    return response.json();
};
