package com.hospital.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hospital.dto.SignupRequest;
import com.hospital.dto.UserResponse;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.repository.UserRepository;
import com.hospital.dto.ChangePasswordRequest;
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(SignupRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        user.setPassword(
            passwordEncoder.encode(request.getPassword())
        );

        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);

        return new UserResponse(savedUser);
    }
    public List<UserResponse> getDoctorUsers() {

        return userRepository.findByRole(Role.DOCTOR)
                .stream()
                .map(UserResponse::new)
                .toList();
    }
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByIdDesc()
                .stream()
                .map(UserResponse::new)
                .toList();
    }

    public UserResponse updateUserStatus(Long id, boolean active, String currentUsername) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getUsername().equals(currentUsername) && !active) {
            throw new RuntimeException("You cannot deactivate your own account");
        }

        user.setActive(active);

        User savedUser = userRepository.save(user);

        return new UserResponse(savedUser);
    }

public void changePassword(
        String username,
        ChangePasswordRequest request) {

    User user = userRepository.findByUsername(username)
            .orElseThrow(() ->
                new RuntimeException("User not found"));

    // Verify old password
    if (!passwordEncoder.matches(
            request.getOldPassword(),
            user.getPassword())) {

        throw new RuntimeException("Old password is incorrect");
    }

    // Prevent using the same password again
    if (passwordEncoder.matches(
            request.getNewPassword(),
            user.getPassword())) {

        throw new RuntimeException(
            "New password must be different from old password");
    }

    // Encode and save new password
    user.setPassword(
        passwordEncoder.encode(request.getNewPassword())
    );

    userRepository.save(user);
}

}