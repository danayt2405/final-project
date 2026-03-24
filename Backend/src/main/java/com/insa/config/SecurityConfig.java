package com.insa.config;

import com.insa.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtTokenProvider tokenProvider;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          JwtTokenProvider tokenProvider) {
        this.userDetailsService = userDetailsService;
        this.tokenProvider = tokenProvider;
    }

    // =========================
    // PASSWORD ENCODER
    // =========================
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================
    // AUTH MANAGER
    // =========================
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http,
                                                       BCryptPasswordEncoder encoder)
            throws Exception {

        AuthenticationManagerBuilder authBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);

        authBuilder
                .userDetailsService(userDetailsService)
                .passwordEncoder(encoder);

        return authBuilder.build();
    }

    // =========================
    // SECURITY FILTER CHAIN
    // =========================
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors().and().csrf().disable()

            .exceptionHandling()
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
            .and()

            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()

            .authorizeRequests()

            // =========================
            // ✅ PUBLIC ENDPOINTS
            // =========================
            .antMatchers("/api/auth/**").permitAll()
            .antMatchers("/api/complaints/submit").permitAll()
            .antMatchers("/api/complaints/submit-with-files").permitAll()
            .antMatchers("/api/complaints/*").permitAll()

            // =========================
            // ✅ ADMINISTRATOR DASHBOARD
            // ONLY administrator should manage admins & departments
            // =========================
            .antMatchers("/api/administrator/**")
            .hasRole("ADMINISTRATOR")

            // =========================
            // ✅ COMPLAINT MANAGEMENT
            // =========================
            .antMatchers("/api/complaints/submitted")
            .hasAnyRole("ADMIN", "SUPER_ADMIN", "ADMINISTRATOR")

            .antMatchers("/api/complaints/**")
            .hasAnyRole("ADMIN", "SUPER_ADMIN", "ADMINISTRATOR")

            // =========================
            // EVERYTHING ELSE
            // =========================
            .anyRequest().authenticated();

        // =========================
        // ✅ JWT FILTER
        // =========================
        JwtAuthenticationFilter jwtFilter =
                new JwtAuthenticationFilter(tokenProvider, userDetailsService);

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}