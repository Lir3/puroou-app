package com.example.spring_boot_app;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/memos")
public class MemoController {

    @Autowired
    private MemoRepository memoRepository;

    /**
     * ログインユーザーのメモを全件取得します
     * @param authentication ログイン情報
     * @return メモ一覧
     */
    @GetMapping
    public List<Memo> getMemos(Authentication authentication) {
        String userId = authentication.getName();
        return memoRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * ログインユーザーのメモを作成します
     * @param body リクエスト情報
     * @param authentication ログイン情報
     * @return 作成したメモ
     */
    @PostMapping
    public ResponseEntity<Memo> createMemo(@Valid @RequestBody MemoDto memoDto, Authentication authentication) {
        String userId =  authentication.getName();
        Memo newMemo = new Memo();
        newMemo.setUserId(userId);
        newMemo.setTitle(memoDto.getTitle());
        newMemo.setContent(memoDto.getContent());
        Memo savedMemo = memoRepository.save(newMemo);
        return new ResponseEntity<>(savedMemo, HttpStatus.CREATED);
    }

    /**
     * ログインユーザーのメモを更新します
     * @param id メモID
     * @param body リクエスト情報
     * @param authentication ログイン情報
     * @return 更新したメモ
     */
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Memo> updateMemo(@PathVariable Long id, @Valid @RequestBody MemoDto memoDto, Authentication authentication) {
        String userId = authentication.getName();
        Memo memo = memoRepository.findByIdAndUserId(id, userId);
        if (memo == null) {
            return ResponseEntity.notFound().build();
        }
        memo.setTitle(memoDto.getTitle());
        memo.setContent(memoDto.getContent());
        Memo updatedMemo = memoRepository.save(memo);
        return ResponseEntity.ok(updatedMemo);
    }

    /**
     * ログインユーザーのメモを削除します
     * @param id メモID
     * @param authentication ログイン情報
     * @return 削除したメモID
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Long> deleteMemo(@PathVariable Long id, Authentication authentication) {
        String userId = authentication.getName();
        Memo memo = memoRepository.findByIdAndUserId(id, userId);
        if (memo == null) {
            return ResponseEntity.notFound().build();
        }
        memoRepository.delete(memo);
        return ResponseEntity.ok(id);
    }

}