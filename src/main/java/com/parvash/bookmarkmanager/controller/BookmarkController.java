package com.parvash.bookmarkmanager.controller;

import com.parvash.bookmarkmanager.dto.BookmarkRequest;
import com.parvash.bookmarkmanager.entity.Bookmark;
import com.parvash.bookmarkmanager.entity.User;
import com.parvash.bookmarkmanager.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @PostMapping
    public ResponseEntity<Bookmark> createBookmark(@RequestBody BookmarkRequest request, @AuthenticationPrincipal User user) {
        Bookmark saved = bookmarkService.createBookmark(request.getUrl(), request.getNotes(), request.getTitle(), request.getTags(), user);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Bookmark>> getAllBookmarks(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookmarkService.getAllBookmarks(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bookmark> getBookmark(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookmarkService.getBookmark(id, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bookmark> updateBookmark(@PathVariable Long id, @RequestBody BookmarkRequest request, @AuthenticationPrincipal User user) {
        Bookmark updated = bookmarkService.updateBookmark(id, request.getTitle(), request.getNotes(), request.getTags(), user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookmark(@PathVariable Long id, @AuthenticationPrincipal User user) {
        bookmarkService.deleteBookmark(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Bookmark>> searchBookmarks(@RequestParam("q") String query, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookmarkService.searchBookmarks(query, user));
    }
}
