package com.hospital.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.dto.DoctorProfileRequest;
import com.hospital.dto.DoctorProfileResponse;
import com.hospital.entity.DoctorProfile;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.repository.DoctorProfileRepository;
import com.hospital.repository.UserRepository;

@Service
public class DoctorProfileService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorProfileService(
            DoctorProfileRepository doctorProfileRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.doctorProfileRepository = doctorProfileRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public DoctorProfileResponse createProfile(
            DoctorProfileRequest request) {

        // Check username
        if (userRepository.existsByUsername(
                request.getUsername())) {

            throw new RuntimeException(
                    "Username already exists");
        }

        // Check email
        if (userRepository.existsByEmail(
                request.getEmail())) {

            throw new RuntimeException(
                    "Email already exists");
        }

        // =========================
        // Create Doctor User Account
        // =========================

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(Role.DOCTOR);

        User savedUser =
                userRepository.save(user);


        // =========================
        // Create Doctor Profile
        // =========================

        DoctorProfile profile =
                new DoctorProfile();

        profile.setUser(savedUser);

        profile.setSpecialization(
                request.getSpecialization());

        profile.setQualification(
                request.getQualification());

        profile.setExperienceYears(
                request.getExperienceYears());

        profile.setConsultationFee(
                request.getConsultationFee());

        profile.setRoomNumber(
                request.getRoomNumber());


        DoctorProfile savedProfile =
                doctorProfileRepository.save(profile);


        return convertToResponse(savedProfile);
    }


    // =========================
    // Get All Doctors
    // =========================

    public List<DoctorProfileResponse> getAllDoctors() {

        return doctorProfileRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================
    // Get Available Doctors
    // =========================

    public List<DoctorProfileResponse> getAvailableDoctors() {

        return doctorProfileRepository
                .findByAvailableTrue()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================
    // Get Doctor By ID
    // =========================

    public DoctorProfileResponse getDoctorById(Long id) {

        DoctorProfile profile =
                doctorProfileRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Doctor profile not found"));

        return convertToResponse(profile);
    }


    // =========================
    // Convert Entity → Response
    // =========================

    private DoctorProfileResponse convertToResponse(
            DoctorProfile profile) {

        DoctorProfileResponse response =
                new DoctorProfileResponse();

        User user = profile.getUser();

        response.setId(profile.getId());
        response.setUserId(user.getId());

        response.setFullName(
                user.getFullName());

        response.setUsername(
                user.getUsername());

        response.setEmail(
                user.getEmail());

        response.setSpecialization(
                profile.getSpecialization());

        response.setQualification(
                profile.getQualification());

        response.setExperienceYears(
                profile.getExperienceYears());

        response.setConsultationFee(
                profile.getConsultationFee());

        response.setRoomNumber(
                profile.getRoomNumber());

        response.setAvailable(
                profile.isAvailable());

        return response;
    }
}