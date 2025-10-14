document.addEventListener('DOMContentLoaded', () => {

    // --- トークン管理 ---
    const sessionData = JSON.parse(localStorage.getItem('user_session'));
    const accessToken = sessionData?.access_token;

    // --- ログイン済の確認 (初期表示時) ---
    (() => {
        if (!accessToken) {
            localStorage.removeItem('user_session');
            window.location.href = '/index.html';
            return;
        }
        document.getElementById('user-email').textContent = sessionData.user?.email;
    })();

        // --- ログアウト処理 ---
    document.getElementById('logout-btn').onclick = async () => {
        try {
            await apiFetch('/api/auth/logout', { method: 'POST' }, accessToken);
            localStorage.removeItem('user_session');
            window.location.href = '/index.html';
        } catch (error) {
            showError(error.message);
        }
    };

        // --- メモ取得処理 ---
    const fetchMemos = async () => {
        try {
            const memos = await apiFetch('/api/memos', {}, accessToken);
            renderMemos(memos);
        } catch (error) {
            showError(error.message);
        }
    };

    // --- メモ作成処理 ---
    const createMemo = async (title, content) => {
        try {
            await apiFetch('/api/memos',
                { method: 'POST', body: JSON.stringify({ title, content }) },
                accessToken
            );
            await fetchMemos();
        } catch (error) {
            showError(error.message);
        }
    };

    // --- メモ更新処理 ---
    const updateMemo = async (id, title, content) => {
        showError('');
        if (!confirm('メモを更新しますか？')) return;
        try {
            await apiFetch(`/api/memos/${id}`,
                { method: 'PUT', body: JSON.stringify({ title, content }) },
                accessToken
            );
            await fetchMemos();
        } catch (error) {
            showError(error.message);
        }
    };

    // --- メモ削除処理 ---
    const deleteMemo = async (id) => {
        showError('');
        if (!confirm('メモを削除しますか？')) return;
        try {
            await apiFetch(`/api/memos/${id}`,
                { method: 'DELETE' },
                accessToken
            );
            await fetchMemos();
        } catch (error) {
            showError(error.message);
        }
    };

    // --- メモ登録 ---
    document.getElementById('create-memo-btn').onclick = async () => {
        showError('');
        const title = document.getElementById('memo-title').value;
        const content = document.getElementById('memo-content').value;
        createMemo(title, content);
        document.getElementById('memo-title').value = '';
        document.getElementById('memo-content').value = '';
    };

    // --- メモ一覧表示 ---
    const renderMemos = (memos) => {
        const memoList = document.getElementById('memo-list');
        memoList.innerHTML = '';
        memos.forEach(memo => {
            const li = document.createElement('li');
            li.className = 'memo-item';
            li.innerHTML = `
                <div class="memo-item-header">
                    <small class="">${new Date(memo.createdAt).toLocaleString()}</small>
                    <div class="memo-item-actions">
                        <button class="btn-update">更新</button>
                        <button class="btn-delete">削除</button>
                    </div>
                </div>
                <input type="text" id="memo-title-${memo.id}" value="${memo.title}">                
                <textarea id="memo-content-${memo.id}" rows="4">${memo.content}</textarea>
            `;
            li.querySelector('.btn-update').addEventListener('click', () => {
                const newTitle = li.querySelector(`#memo-title-${memo.id}`).value;
                const newContent = li.querySelector(`#memo-content-${memo.id}`).value;
                updateMemo(memo.id, newTitle, newContent);
            });
            li.querySelector('.btn-delete').addEventListener('click', () => deleteMemo(memo.id));
            memoList.appendChild(li);
        });
    };

        // --- ログイン済の確認 (初期表示時) ---
    (() => {
        if (!accessToken) {
            localStorage.removeItem('user_session');
            window.location.href = '/index.html';
            return;
        }
        document.getElementById('user-email').textContent = sessionData.user?.email;
        // 以下の行のみ追加
        fetchMemos();
    })();

});
