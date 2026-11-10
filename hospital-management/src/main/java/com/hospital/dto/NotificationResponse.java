
package com.hospital.dto;

import java.time.LocalDateTime;

import com.hospital.entity.Notification;

public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private String type;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String link;

    public NotificationResponse(Notification notification) {

        this.id = notification.getId();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.type = notification.getType();
        this.isRead = notification.isRead();
        this.createdAt = notification.getCreatedAt();
        this.link = notification.getLink();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getType() {
        return type;
    }

    public boolean isRead() {
        return isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getLink() {
        return link;
    }
}