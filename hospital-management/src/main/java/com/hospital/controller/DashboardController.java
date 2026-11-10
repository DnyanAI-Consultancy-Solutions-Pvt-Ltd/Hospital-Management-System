package com.hospital.controller;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.entity.Appointment;
import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
public class DashboardController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public DashboardController(
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    // Existing live statistics API
    @GetMapping("/stats")
    public Map<String, Long> getDashboardStats() {
        return Map.of(
            "totalPatients", patientRepository.count(),
            "emergencyAppointments", appointmentRepository.countByEmergencyTrue(),
            "totalDoctors", userRepository.countByRole(Role.DOCTOR)
        );
    }

    // Today's appointments
    @GetMapping("/today-appointments")
    public List<Map<String, Object>> getTodayAppointments() {

        LocalDate today = LocalDate.now(
            ZoneId.of("Asia/Kolkata")
        );

        List<Appointment> appointments =
            appointmentRepository
                .findByAppointmentDateOrderByAppointmentTimeAsc(today);

        List<Map<String, Object>> result = new ArrayList<>();

        for (Appointment appointment : appointments) {
            Map<String, Object> item = new LinkedHashMap<>();

            item.put("id", appointment.getId());
            item.put("appointmentDate", appointment.getAppointmentDate());
            item.put("appointmentTime", appointment.getAppointmentTime());
            item.put("tokenNumber", appointment.getTokenNumber());
            item.put("status", appointment.getStatus());

            Patient patient = appointment.getPatient();

            item.put(
                "patientName",
                patient != null ? patient.getFullName() : "N/A"
            );
            item.put(
            	    "doctorName",
            	    appointment.getDoctor() != null
            	        && appointment.getDoctor().getUser() != null
            	            ? appointment.getDoctor().getUser().getFullName()
            	            : "Doctor not assigned"
            	);

            result.add(item);
        }

        return result;
    }

    // Latest five patients
    @GetMapping("/recent-patients")
    public List<Map<String, Object>> getRecentPatients() {

        List<Patient> patients =
            patientRepository.findTop5ByOrderByIdDesc();

        List<Map<String, Object>> result = new ArrayList<>();

        for (Patient patient : patients) {
            Map<String, Object> item = new LinkedHashMap<>();

            item.put("id", patient.getId());
            item.put("name", patient.getFullName());

            // Include these fields only if they exist in your Patient entity.
            // Rename the getters if your entity uses different names.
            item.put("gender", patient.getGender());
            item.put("status", "Registered");
            result.add(item);
        }

        return result;
    }
}