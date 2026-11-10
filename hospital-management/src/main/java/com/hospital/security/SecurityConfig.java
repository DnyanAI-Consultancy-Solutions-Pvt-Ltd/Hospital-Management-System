
package com.hospital.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(
                    corsConfigurationSource()))
            .sessionManagement(session -> session
                    .sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/auth/login"
                ).permitAll()

                // Development testing only:
                // Public signup; restrict roles on the server.
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/users"
                ).permitAll()

                .requestMatchers(
                	    HttpMethod.GET,
                	    "/api/doctors/available"
                	).hasAnyRole("ADMIN", "RECEPTIONIST", "DOCTOR")

                .requestMatchers("/api/doctors/**")
                .hasAnyRole("ADMIN", "RECEPTIONIST", "DOCTOR")
                    .requestMatchers("/api/dashboard/**")
                    .hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers("/api/appointments/**")
                    .authenticated()

                .requestMatchers("/api/patients/**")
                    .authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:5173",
            "https://*.hf.space",
            "https://huggingface.co"
        ));

        configuration.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "DELETE",
            "PATCH", "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
            "Authorization", "Content-Type"
        ));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}