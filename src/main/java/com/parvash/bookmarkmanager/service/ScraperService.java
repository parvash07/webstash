package com.parvash.bookmarkmanager.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ScraperService {

    private static final Logger log = LoggerFactory.getLogger(ScraperService.class);

    public String scrapeContent(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                    .timeout(10000)
                    .followRedirects(true)
                    .get();

            String text = doc.body() != null ? doc.body().text() : "";
            if (text.isBlank()) {
                log.warn("Scraped content is empty for URL: {}", url);
                String title = doc.title();
                String metaDesc = doc.select("meta[name=description]").attr("content");
                text = (title + " " + metaDesc).trim();
            }
            return text;
        } catch (Exception e) {
            log.error("Failed to scrape URL: {} - {}", url, e.getMessage());
            throw new RuntimeException("Failed to scrape URL: " + url, e);
        }
    }
}
