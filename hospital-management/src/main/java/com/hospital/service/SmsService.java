package com.hospital.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SmsService {

    @Value("${msg91.authkey}")
    private String authKey;

    @Value("${msg91.template-id}")
    private String templateId;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendAppointmentSms(
            String mobileNumber,
            String patientName,
            Integer tokenNumber,
            String doctorName,
            String appointmentDate,
            String appointmentTime) {

        String mobile = mobileNumber.replaceAll("[^0-9]", "");

        if (mobile.length() == 10) {
            mobile = "91" + mobile;
        }

        Map<String, Object> recipient = Map.of(
                "mobiles", mobile,
                "VAR1", patientName,
                "VAR2", String.valueOf(tokenNumber),
                "VAR3", doctorName,
                "VAR4", appointmentDate,
                "VAR5", appointmentTime
        );

        Map<String, Object> body = Map.of(
                "template_id", templateId,
                "short_url", "0",
                "recipients", new Map[]{recipient}
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(
                java.util.List.of(MediaType.APPLICATION_JSON)
        );
        headers.set("authkey", authKey);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        try {
            String response = restTemplate.postForObject(
                    "https://control.msg91.com/api/v5/flow",
                    request,
                    String.class
            );

            System.out.println("MSG91 RESPONSE: " + response);

        } catch (Exception e) {
            System.err.println(
                    "SMS sending failed: " + e.getMessage()
            );
        }
    }
}