package com.insa.controller;

import com.insa.dto.JwtResponse;
import com.insa.dto.LoginRequest;
import com.insa.entity.User;
import com.insa.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.Data;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService a) {
        this.auth = a;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            return ResponseEntity.ok(auth.login(req));
        } catch (Exception ex) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> regAdmin(@RequestBody AdminCreateRequest r) {
        return ResponseEntity.ok(auth.registerAdmin(r.toUser(), r.password, r.typeId));
    }

    @PostMapping("/register-superadmin")
    public ResponseEntity<?> regSuper(@RequestBody SuperCreateRequest r) {
        return ResponseEntity.ok(auth.registerSuperAdmin(r.toUser(), r.password));
    }

    @Data
    public static class AdminCreateRequest {
        private String username;
        private String fullName;
        private String password;
        private Long typeId;

        public User toUser() {
            User u = new User();
            u.setUsername(username);
            u.setFullName(fullName);
            return u;
        }
    }

    @Data
    public static class SuperCreateRequest {
        private String username;
        private String fullName;
        private String password;

        public User toUser() {
            User u = new User();
            u.setUsername(username);
            u.setFullName(fullName);
            return u;
        }
    }
}
