package com.hospital.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital.dto.NotificationResponse;
import com.hospital.entity.Notification;
import com.hospital.entity.User;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

	List<Notification> findByUserOrderByCreatedAtDesc(User user);

	List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(
            User user);

    long countByUserAndIsReadFalse(User user);
}
