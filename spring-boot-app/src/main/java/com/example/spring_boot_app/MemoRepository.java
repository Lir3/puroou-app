package com.example.spring_boot_app;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MemoRepository extends JpaRepository<Memo, Long> {

    /**
     * ユーザーIDでメモを検索します
     * @param userId ユーザID
     * @return メモ一覧
     */
    List<Memo> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * IDとユーザーIDでメモを検索します
     * @param id ID
     * @param userId ユーザID
     * @return メモ
     */
    Memo findByIdAndUserId(Long id, String userId);
}