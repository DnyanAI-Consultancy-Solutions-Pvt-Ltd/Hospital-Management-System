
package com.hospital.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.hospital.dto.NotificationResponse;
import com.hospital.entity.Notification;
import com.hospital.entity.User;
import com.hospital.repository.NotificationRepository;
import com.hospital.repository.UserRepository;
import com.hospital.entity.Role;
import java.util.ArrayList;
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Create notification for a specific user
    public Notification createNotification(
            Long userId,
            String title,
            String message,
            String type,
            String link) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                    new RuntimeException("User not found"));

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLink(link);
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    // Get all notifications for logged-in user
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                    new RuntimeException("User not found"));

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(NotificationResponse::new)
                .toList();
    }
    // Get unread notifications
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                    new RuntimeException("User not found"));

        return notificationRepository
                .findByUserAndIsReadFalseOrderByCreatedAtDesc(user)
                .stream()
                .map(NotificationResponse::new)
                .toList();
    }

    // Get unread count
    public long getUnreadCount(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                    new RuntimeException("User not found"));

        return notificationRepository
                .countByUserAndIsReadFalse(user);
    }

    // Mark notification as read
    public void markAsRead(Long notificationId, String username) {

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                    new RuntimeException("Notification not found"));

        if (!notification.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // Delete notification belonging to logged-in user
    public void deleteNotification(Long notificationId, String username) {

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                    new RuntimeException("Notification not found"));

        if (!notification.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }

        notificationRepository.delete(notification);
    }

 // Create notification for all active users of a particular role
 public void notifyRole(
         Role role,
         String title,
         String message,
         String type,
         String link) {

     List<User> users = userRepository.findByRole(role)
             .stream()
             .filter(User::isActive)
             .toList();

     List<Notification> notifications = users.stream()
             .map(user -> {
                 Notification notification = new Notification();
                 notification.setUser(user);
                 notification.setTitle(title);
                 notification.setMessage(message);
                 notification.setType(type);
                 notification.setLink(link);
                 notification.setRead(false);
                 return notification;
             })
             .toList();

     if (!notifications.isEmpty()) {
         notificationRepository.saveAll(notifications);
     }
 }

}
