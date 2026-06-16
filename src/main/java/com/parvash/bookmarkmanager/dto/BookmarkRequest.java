package com.parvash.bookmarkmanager.dto;

import lombok.Data;
import java.util.List;

@Data
public class BookmarkRequest {
    private String url;
    private String notes;
    private String title;
    private List<String> tags;
}
