package com.hospital.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.hospital.entity.User;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody com.hospital.dto.LoginRequest request) {
    	 System.out.println("Login request received");
    	    System.out.println("Username received: [" + request.getUsername() + "]");

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Username does not exist");
        }
        if (!user.isActive()) {
            return ResponseEntity
                    .status(403)
                    .body("Your account is deactivated. Please contact administrator.");
        }
        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid password");
        }
        // Generate JWT token
        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(
                java.util.Map.of(
                        "message", "Login successful",
                        "token", token,
                        "id", user.getId(),
                        "fullName", user.getFullName(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        );
    }
}