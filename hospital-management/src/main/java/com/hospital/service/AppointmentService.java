package com.hospital.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.entity.Appointment;
import com.hospital.entity.AppointmentStatus;
import com.hospital.entity.DoctorProfile;
import com.hospital.entity.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorProfileRepository;
import com.hospital.repository.PatientRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final SmsService smsService;
    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorProfileRepository doctorProfileRepository,SmsService smsService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorProfileRepository = doctorProfileRepository;
    	this.smsService = smsService;

    }


    // Create Appointment
    @Transactional
    public AppointmentResponse createAppointment(
            AppointmentRequest request) {

        // Find Patient
        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found"));


        // Find Doctor
        DoctorProfile doctor = doctorProfileRepository
                .findById(request.getDoctorId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Doctor not found"));


        // Check Doctor Availability
        if (!doctor.isAvailable()) {

            throw new RuntimeException(
                    "Doctor is currently not available");
        }


        // Check duplicate appointment
        List<Appointment> doctorAppointments =
                appointmentRepository
                    .findByDoctorIdAndAppointmentDate(
                            doctor.getId(),
                            request.getAppointmentDate()
                    );

        boolean alreadyBooked =
                doctorAppointments.stream()
                    .anyMatch(appointment ->
                        appointment.getAppointmentTime()
                            .equals(request.getAppointmentTime())
                        &&
                        appointment.getStatus()
                            != AppointmentStatus.CANCELLED
                    );

        if (alreadyBooked) {

            throw new RuntimeException(
                    "Doctor already has an appointment at this date and time");
        }


        // Create Appointment
        Appointment appointment =
                new Appointment();

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(
                request.getAppointmentDate());
        appointment.setAppointmentTime(
                request.getAppointmentTime());
        appointment.setReason(
                request.getReason());
        appointment.setReferredBy(request.getReferredBy());
        int existingAppointments =
                appointmentRepository
                    .countByDoctorIdAndAppointmentDateAndStatusNot(
                        doctor.getId(),
                        request.getAppointmentDate(),
                        AppointmentStatus.CANCELLED
                    );

        int tokenNumber = existingAppointments + 1;
        appointment.setTokenNumber(tokenNumber);
        // Default status
        appointment.setStatus(
                AppointmentStatus.BOOKED);


        // Save
        Appointment savedAppointment =
                appointmentRepository.save(
                        appointment);
        smsService.sendAppointmentSms(
                patient.getMobileNumber(),
                patient.getFullName(),
                savedAppointment.getTokenNumber(),
                doctor.getUser().getFullName(),
                savedAppointment.getAppointmentDate().toString(),
                savedAppointment.getAppointmentTime().toString()
        );

        return convertToResponse(
                savedAppointment);
    }


    // Get All Appointments
    public List<AppointmentResponse> getAllAppointments() {

        return appointmentRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // Get Appointments by Doctor
    public List<AppointmentResponse> getAppointmentsByDoctor(
            Long doctorId) {

        // Verify doctor exists
        if (!doctorProfileRepository.existsById(doctorId)) {

            throw new RuntimeException(
                    "Doctor not found");
        }

        return appointmentRepository
                .findByDoctorId(doctorId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // Get Appointments by Patient
    public List<AppointmentResponse> getAppointmentsByPatient(
            Long patientId) {

        // Verify patient exists
        if (!patientRepository.existsById(patientId)) {

            throw new RuntimeException(
                    "Patient not found");
        }

        return appointmentRepository
                .findByPatientId(patientId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // Get Appointments by Date
    public List<AppointmentResponse> getAppointmentsByDate(
            LocalDate date) {

        return appointmentRepository
                .findByAppointmentDate(date)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // Get Doctor Appointments by Date
    public List<AppointmentResponse>
    getDoctorAppointmentsByDate(
            Long doctorId,
            LocalDate date) {

        if (!doctorProfileRepository.existsById(doctorId)) {

            throw new RuntimeException(
                    "Doctor not found");
        }

        return appointmentRepository
                .findByDoctorIdAndAppointmentDate(
                        doctorId,
                        date)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // Update Appointment Status
    @Transactional
    public AppointmentResponse updateStatus(
            Long appointmentId,
            AppointmentStatus status) {

        Appointment appointment =
                appointmentRepository
                    .findById(appointmentId)
                    .orElseThrow(() ->
                        new RuntimeException(
                                "Appointment not found"));

        appointment.setStatus(status);

        Appointment updatedAppointment =
                appointmentRepository.save(
                        appointment);

        return convertToResponse(
                updatedAppointment);
    }


    // Convert Entity → Response DTO
    private AppointmentResponse convertToResponse(
            Appointment appointment) {

        AppointmentResponse response =
                new AppointmentResponse();

        Patient patient =
                appointment.getPatient();

        DoctorProfile doctor =
                appointment.getDoctor();


        response.setId(
                appointment.getId());

        // Patient information
        response.setPatientId(
                patient.getId());

        response.setRegistrationNumber(
                patient.getRegistrationNumber());

        response.setPatientName(
                patient.getFullName());


        // Doctor information
        response.setDoctorId(
                doctor.getId());

        response.setDoctorName(
                doctor.getUser().getFullName());

        response.setSpecialization(
                doctor.getSpecialization());


        // Appointment information
        response.setAppointmentDate(
                appointment.getAppointmentDate());

        response.setAppointmentTime(
                appointment.getAppointmentTime());

        response.setReason(
                appointment.getReason());
        response.setReferredBy(appointment.getReferredBy());

        response.setStatus(
                appointment.getStatus());

        response.setTokenNumber(
                appointment.getTokenNumber());
        return response;
    }
}