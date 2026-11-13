package com.hospital.service;
import com.hospital.entity.Role;
import com.hospital.service.NotificationService;
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
    private final NotificationService notificationService;
    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorProfileRepository doctorProfileRepository,
            NotificationService notificationService) {

        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.notificationService = notificationService;
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
        appointment.setEmergency(request.isEmergency());
        
        appointment.setStatus(
                AppointmentStatus.BOOKED);
        
        // Save
        Appointment savedAppointment =
                appointmentRepository.save(
                        appointment);

String patientName = patient.getFullName();
String doctorName = doctor.getUser().getFullName();

String appointmentMessage =
        "Appointment booked for " + patientName
        + " with Dr. " + doctorName
        + " on " + request.getAppointmentDate()
        + " at " + request.getAppointmentTime() + ".";

// Notify ADMIN
notificationService.notifyRole(
        Role.ADMIN,
        "New Appointment Booked",
        appointmentMessage,
        "APPOINTMENT",
        "/appointments"
);

// Notify RECEPTIONIST
notificationService.notifyRole(
        Role.RECEPTIONIST,
        "New Appointment Booked",
        appointmentMessage,
        "APPOINTMENT",
        "/appointments"
);

// Notify assigned DOCTOR only
notificationService.createNotification(
        doctor.getUser().getId(),
        "New Appointment Assigned",
        appointmentMessage,
        "APPOINTMENT",
        "/doctor-module"
);

       
        return convertToResponse(
                savedAppointment);
    }
    @Transactional
    public AppointmentResponse checkIn(Long appointmentId) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() ->
                        new RuntimeException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException(
                    "Cancelled appointment cannot be checked in");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException(
                    "Completed appointment cannot be checked in");
        }

        if (appointment.getStatus() == AppointmentStatus.CHECKED_IN) {
            throw new RuntimeException(
                    "Patient is already checked in");
        }

        appointment.setStatus(AppointmentStatus.CHECKED_IN);

        Appointment updated = appointmentRepository.save(appointment);

        return convertToResponse(updated);
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

    Appointment appointment = appointmentRepository
            .findById(appointmentId)
            .orElseThrow(() ->
                    new RuntimeException("Appointment not found"));

    AppointmentStatus oldStatus = appointment.getStatus();

    // No notification if status has not changed
    if (oldStatus == status) {
        return convertToResponse(appointment);
    }

    appointment.setStatus(status);

    Appointment updatedAppointment =
            appointmentRepository.save(appointment);

    Patient patient = updatedAppointment.getPatient();
    DoctorProfile doctor = updatedAppointment.getDoctor();

    String title;
    String message;

    switch (status) {
        case CANCELLED:
            title = "Appointment Cancelled";
            message = "Appointment for " + patient.getFullName()
                    + " with Dr. " + doctor.getUser().getFullName()
                    + " has been cancelled.";
            break;

        case COMPLETED:
            title = "Appointment Completed";
            message = "Appointment for " + patient.getFullName()
                    + " with Dr. " + doctor.getUser().getFullName()
                    + " has been completed.";
            break;

        case BOOKED:
            title = "Appointment Confirmed";
            message = "Appointment for " + patient.getFullName()
                    + " with Dr. " + doctor.getUser().getFullName()
                    + " is confirmed.";
            break;

        default:
            title = "Appointment Status Updated";
            message = "Appointment for " + patient.getFullName()
                    + " status changed from " + oldStatus
                    + " to " + status + ".";
    }

    // Notify ADMIN
    notificationService.notifyRole(
            Role.ADMIN,
            title,
            message,
            "APPOINTMENT",
            "/appointments"
    );

    // Notify RECEPTIONIST
    notificationService.notifyRole(
            Role.RECEPTIONIST,
            title,
            message,
            "APPOINTMENT",
            "/appointments"
    );

    // Notify assigned DOCTOR
    notificationService.createNotification(
            doctor.getUser().getId(),
            title,
            message,
            "APPOINTMENT",
            "/doctor-module"
    );

    return convertToResponse(updatedAppointment);
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
        response.setEmergency(appointment.isEmergency());
        return response;
    }
}