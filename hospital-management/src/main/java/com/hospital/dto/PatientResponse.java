package com.hospital.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.hospital.entity.Patient;

public class PatientResponse {

    private Long id;
    private String registrationNumber;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String mobileNumber;
    private String email;
    private String address;
    private String emergencyContact;
    private LocalDateTime createdAt;

    public PatientResponse(Patient patient) {

        this.id = patient.getId();
        this.registrationNumber = patient.getRegistrationNumber();
        this.fullName = patient.getFullName();
        this.dateOfBirth = patient.getDateOfBirth();
        this.gender = patient.getGender();
        this.bloodGroup = patient.getBloodGroup();
        this.mobileNumber = patient.getMobileNumber();
        this.email = patient.getEmail();
        this.address = patient.getAddress();
        this.emergencyContact = patient.getEmergencyContact();
        this.createdAt = patient.getCreatedAt();
    }

    public PatientResponse() {
		// TODO Auto-generated constructor stub
	}

	public Long getId() {
        return id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public String getEmail() {
        return email;
    }

    public String getAddress() {
        return address;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}