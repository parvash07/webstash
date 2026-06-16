package com.parvash.bookmarkmanager.repository;

import com.parvash.bookmarkmanager.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findAllByUserId(Long userId);
    Optional<Bookmark> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT b FROM Bookmark b WHERE b.user.id = :userId AND (LOWER(b.title) LIKE LOWER(:query) OR LOWER(b.notes) LIKE LOWER(:query) OR LOWER(b.summary) LIKE LOWER(:query))")
    List<Bookmark> searchByText(@Param("userId") Long userId, @Param("query") String query);
}
