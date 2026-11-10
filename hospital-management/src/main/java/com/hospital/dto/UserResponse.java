package com.hospital.dto;

import com.hospital.entity.Role;
import com.hospital.entity.User;

public class UserResponse {

    private Long id;
    private String fullName;
    private String username;
    private String email;
    private Role role;
    private boolean active;

    public UserResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.active = user.isActive();
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }
}