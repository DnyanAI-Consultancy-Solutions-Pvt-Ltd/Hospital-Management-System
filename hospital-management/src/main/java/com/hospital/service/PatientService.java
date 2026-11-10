package com.hospital.service;
import com.hospital.entity.Role;
import java.time.Year;
import java.util.List;

import org.springframework.stereotype.Service;

import com.hospital.dto.PatientRequest;
import com.hospital.dto.PatientResponse;
import com.hospital.entity.Patient;
import com.hospital.repository.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final NotificationService notificationService;
    public PatientService(
            PatientRepository patientRepository,
            NotificationService notificationService) {

        this.patientRepository = patientRepository;
        this.notificationService = notificationService;
    }
    // Register Patient

public PatientResponse createPatient(PatientRequest request) {

    if (patientRepository.existsByMobileNumber(request.getMobileNumber())) {
        throw new RuntimeException(
                "Patient with this mobile number already exists");
    }

    Patient patient = new Patient();

    patient.setRegistrationNumber(generateRegistrationNumber());
    patient.setFullName(request.getFullName());
    patient.setDateOfBirth(request.getDateOfBirth());
    patient.setGender(request.getGender());
    patient.setBloodGroup(request.getBloodGroup());
    patient.setMobileNumber(request.getMobileNumber());
    patient.setEmail(request.getEmail());
    patient.setAddress(request.getAddress());
    patient.setEmergencyContact(request.getEmergencyContact());

    Patient savedPatient = patientRepository.save(patient);

    // Notify ADMIN
    notificationService.notifyRole(
            Role.ADMIN,
            "New Patient Registered",
            savedPatient.getFullName()
                    + " has been successfully registered.",
            "PATIENT",
            "/patients"
    );

    // Notify RECEPTIONIST
    notificationService.notifyRole(
            Role.RECEPTIONIST,
            "New Patient Registered",
            savedPatient.getFullName()
                    + " has been successfully registered.",
            "PATIENT",
            "/patients"
    );

    return new PatientResponse(savedPatient);
}

    // Get All Patients
    public List<PatientResponse> getAllPatients() {

        return patientRepository.findAll()
                .stream()
                .map(PatientResponse::new)
                .toList();
    }

    // Get Patient By ID
    public PatientResponse getPatientById(Long id) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found with id: " + id));

        return new PatientResponse(patient);
    }

    // Update Patient
    public PatientResponse updatePatient(
            Long id,
            PatientRequest request) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found with id: " + id));

        if (!patient.getMobileNumber().equals(request.getMobileNumber())
                && patientRepository.existsByMobileNumber(
                        request.getMobileNumber())) {

            throw new RuntimeException(
                    "Patient with this mobile number already exists");
        }

        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setMobileNumber(request.getMobileNumber());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(request.getEmergencyContact());

        Patient updatedPatient = patientRepository.save(patient);

        return new PatientResponse(updatedPatient);
    }

    // Delete Patient
    public void deletePatient(Long id) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found with id: " + id));

        patientRepository.delete(patient);
    }

    // Generate Registration Number
    private String generateRegistrationNumber() {

        int year = Year.now().getValue();

        long count = patientRepository.count() + 1;

        return String.format(
                "PAT-%d-%06d",
                year,
                count
        );
    }
    
    public Page<PatientResponse> searchPatients(
            String query,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Patient> patients;

        if (query == null || query.trim().isEmpty()) {
            patients = patientRepository.findAll(pageable);
        } else {
            String searchText = query.trim();

            patients =
                    patientRepository
                            .findByFullNameContainingIgnoreCaseOrMobileNumberContainingOrRegistrationNumberContainingIgnoreCase(
                                    searchText,
                                    searchText,
                                    searchText,
                                    pageable
                            );
        }

        return patients.map(PatientResponse::new);    }
}