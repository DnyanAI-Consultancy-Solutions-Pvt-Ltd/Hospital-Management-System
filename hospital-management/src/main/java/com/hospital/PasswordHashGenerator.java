package com.hospital;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        String password = "Nikhil123!";

        System.out.println(encoder.encode(password));
    }
}