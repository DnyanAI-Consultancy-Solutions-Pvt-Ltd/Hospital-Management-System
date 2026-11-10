package com.hospital.controller;
import com.hospital.dto.ChangePasswordRequest;
import org.springframework.security.core.Authentication;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.hospital.dto.SignupRequest;
import com.hospital.dto.UserResponse;
import com.hospital.service.UserService;
import java.util.Map;
import org.springframework.security.core.Authentication;
@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {

        Boolean active = request.get("active");

        if (active == null) {
            return ResponseEntity.badRequest().body("Active status is required");
        }

        try {
            UserResponse response = userService.updateUserStatus(
                    id, active, authentication.getName()
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody SignupRequest request) {

        UserResponse response = userService.createUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @GetMapping("/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getDoctorUsers() {

        return ResponseEntity.ok(
                userService.getDoctorUsers()
        );
    }

@PostMapping("/change-password")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> changePassword(
        @Valid @RequestBody ChangePasswordRequest request,
        Authentication authentication) {

    try {
        userService.changePassword(
            authentication.getName(),
            request
        );

        return ResponseEntity.ok(
            Map.of("message", "Password updated successfully")
        );

    } catch (RuntimeException e) {
        return ResponseEntity
                .badRequest()
                .body(Map.of("message", e.getMessage()));
    }
}

}