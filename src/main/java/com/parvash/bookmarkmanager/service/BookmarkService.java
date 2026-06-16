package com.parvash.bookmarkmanager.service;

import com.parvash.bookmarkmanager.entity.Bookmark;
import com.parvash.bookmarkmanager.entity.User;
import com.parvash.bookmarkmanager.repository.BookmarkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class BookmarkService {

    private static final Logger log = LoggerFactory.getLogger(BookmarkService.class);
    private static final int MAX_CONTENT_LENGTH = 5000;

    private final BookmarkRepository bookmarkRepository;
    private final ScraperService scraperService;
    private final ChatClient chatClient;

    public BookmarkService(BookmarkRepository bookmarkRepository, ScraperService scraperService, ChatClient.Builder chatClientBuilder) {
        this.bookmarkRepository = bookmarkRepository;
        this.scraperService = scraperService;
        this.chatClient = chatClientBuilder.build();
    }

    public record AiExtractedData(String title, String summary, List<String> tags) {}

    public Bookmark createBookmark(String url, String notes, String title, List<String> tags, User user) {
        Bookmark bookmark = new Bookmark();
        bookmark.setUrl(url);
        bookmark.setNotes(notes);
        bookmark.setUser(user);
        bookmark.setTitle(title != null && !title.isBlank() ? title : url);
        if (tags != null && !tags.isEmpty()) {
            bookmark.setTags(tags);
        }

        Bookmark savedBookmark = bookmarkRepository.save(bookmark);
        log.info("Bookmark saved with id: {}", savedBookmark.getId());

        final Long bookmarkId = savedBookmark.getId();
        CompletableFuture.runAsync(() -> {
            try {
                processBookmarkAsync(bookmarkId, url, notes, title, tags);
            } catch (Exception e) {
                log.error("Async processing failed for bookmark id: {}", bookmarkId, e);
            }
        });

        return savedBookmark;
    }

    private void processBookmarkAsync(Long bookmarkId, String url, String notes, String title, List<String> tags) {
        String content = null;
        try {
            content = scraperService.scrapeContent(url);
            log.info("Scraped {} chars from URL: {}", content.length(), url);
            if (content.length() > MAX_CONTENT_LENGTH) {
                content = content.substring(0, MAX_CONTENT_LENGTH);
            }
        } catch (Exception e) {
            log.warn("Failed to scrape URL: {}. Error: {}", url, e.getMessage());
        }

        AiExtractedData extractedData = null;
        if (content != null && !content.isBlank()) {
            try {
                String prompt = "You are an expert bookmark summarizer. Analyze the following webpage content and extract structured metadata.\n\n" +
                        "Instructions:\n" +
                        "- title: The actual page title or a clear descriptive title if none exists.\n" +
                        "- summary: A concise 2-3 sentence summary covering: what this page is about, the key insight or takeaway, and why someone would bookmark it. Be specific and informative, not generic.\n" +
                        "- tags: 3-5 lowercase, specific topic tags (e.g. 'react-hooks', 'system-design', 'css-grid'). Avoid vague tags like 'technology' or 'article'.\n\n" +
                        "Content:\n" + content;

                extractedData = chatClient.prompt()
                        .user(prompt)
                        .call()
                        .entity(new ParameterizedTypeReference<AiExtractedData>() {});
                log.info("AI extraction for URL: {} -> title='{}', tags={}", url,
                        extractedData != null ? extractedData.title() : "null",
                        extractedData != null ? extractedData.tags() : "null");
            } catch (Exception e) {
                log.error("AI call failed for URL: {}. Error: {}", url, e.getMessage());
            }
        }

        try {
            Bookmark bookmark = bookmarkRepository.findById(bookmarkId).orElse(null);
            if (bookmark == null) return;

            boolean updated = false;
            if (extractedData != null) {
                if (extractedData.summary() != null) {
                    bookmark.setSummary(extractedData.summary());
                    updated = true;
                }
                if ((title == null || title.isBlank()) && extractedData.title() != null && !extractedData.title().isBlank()) {
                    bookmark.setTitle(extractedData.title());
                    updated = true;
                }
                if ((tags == null || tags.isEmpty()) && extractedData.tags() != null) {
                    bookmark.setTags(extractedData.tags());
                    updated = true;
                }
            }
            if (updated) {
                bookmarkRepository.save(bookmark);
            }
        } catch (Exception e) {
            log.error("Failed to update bookmark {} with AI data: {}", bookmarkId, e.getMessage());
        }
    }

    public List<Bookmark> searchBookmarks(String query, User user) {
        List<Bookmark> allBookmarks = bookmarkRepository.findAllByUserId(user.getId());

        if (allBookmarks.isEmpty()) {
            return List.of();
        }

        try {
            StringBuilder prompt = new StringBuilder();
            prompt.append("You are a semantic search engine for bookmarks. Given a search query and a list of bookmarks, ")
                  .append("return ONLY the IDs of bookmarks that are semantically relevant to the query.\n")
                  .append("Consider meaning, topic, and intent — not just keyword overlap.\n\n")
                  .append("Search query: \"").append(query).append("\"\n\n")
                  .append("Bookmarks:\n");

            for (Bookmark b : allBookmarks) {
                prompt.append("- ID:").append(b.getId())
                      .append(" | Title: \"").append(b.getTitle() != null ? b.getTitle() : "").append("\"")
                      .append(" | Summary: \"").append(b.getSummary() != null ? b.getSummary() : "").append("\"")
                      .append(" | Tags: ").append(b.getTags() != null ? b.getTags() : List.of())
                      .append("\n");
            }

            prompt.append("\nReturn a JSON array of matching bookmark IDs, e.g. [1, 5, 12]. ")
                  .append("Return [] if nothing matches. Only return IDs, no explanation.");

            List<Long> matchingIds = chatClient.prompt()
                    .user(prompt.toString())
                    .call()
                    .entity(new ParameterizedTypeReference<List<Long>>() {});

            if (matchingIds != null && !matchingIds.isEmpty()) {
                List<Bookmark> results = bookmarkRepository.findAllById(matchingIds).stream()
                        .filter(b -> b.getUser().getId().equals(user.getId()))
                        .toList();
                if (!results.isEmpty()) {
                    log.info("Semantic search returned {} results for query: {}", results.size(), query);
                    return results;
                }
            }
        } catch (Exception e) {
            log.warn("Semantic search via LLM failed, falling back to text search: {}", e.getMessage());
        }

        log.info("Falling back to text search for query: {}", query);
        return bookmarkRepository.searchByText(user.getId(), "%" + query + "%");
    }

    public List<Bookmark> getAllBookmarks(User user) {
        return bookmarkRepository.findAllByUserId(user.getId());
    }

    public Bookmark getBookmark(Long id, User user) {
        return bookmarkRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Bookmark not found"));
    }

    public Bookmark updateBookmark(Long id, String title, String notes, List<String> tags, User user) {
        Bookmark bookmark = getBookmark(id, user);

        if (title != null) bookmark.setTitle(title);
        if (notes != null) bookmark.setNotes(notes);
        if (tags != null) bookmark.setTags(tags);

        return bookmarkRepository.save(bookmark);
    }

    public void deleteBookmark(Long id, User user) {
        Bookmark bookmark = getBookmark(id, user);
        bookmarkRepository.delete(bookmark);
    }
}
