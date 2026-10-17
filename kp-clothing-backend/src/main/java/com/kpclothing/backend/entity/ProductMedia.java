package com.kpclothing.backend.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class ProductMedia implements Serializable {

    private String url;
    private String type; // IMAGE | VIDEO
    private String view; // FRONT | BACK | SIDE | FABRIC | OTHER
    private int sortOrder;

    public ProductMedia() {}

    public ProductMedia(String url, String type, String view, int sortOrder) {
        this.url = url;
        this.type = type != null ? type : "IMAGE";
        this.view = view != null ? view : "OTHER";
        this.sortOrder = sortOrder;
    }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getView() { return view; }
    public void setView(String view) { this.view = view; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
