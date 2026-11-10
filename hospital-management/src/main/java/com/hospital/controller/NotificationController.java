
package com.hospital.controller;

import java.util.List;
import java.util.Map;
import com.hospital.dto.NotificationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hospital.entity.Notification;
import com.hospital.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    // Get all notifications for logged-in user
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(         
    		Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getMyNotifications(
                        authentication.getName()
                )
        );
    }

    // Get unread notifications
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
    		Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(
                        authentication.getName()
                )
        );
    }

    // Get unread notification count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            Authentication authentication) {

        long count = notificationService.getUnreadCount(
                authentication.getName()
        );

        return ResponseEntity.ok(
                Map.of("count", count)
        );
    }

    // Mark notification as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        notificationService.markAsRead(
                id,
                authentication.getName()
        );

        return ResponseEntity.ok(
                Map.of("message", "Notification marked as read")
        );
    }

    // Delete notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {

        notificationService.deleteNotification(
                id,
                authentication.getName()
        );

        return ResponseEntity.ok(
                Map.of("message", "Notification deleted successfully")
        );
    }
}