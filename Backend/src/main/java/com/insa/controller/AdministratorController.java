package com.insa.controller;

import com.insa.entity.User;
import com.insa.entity.ComplaintType;
import com.insa.entity.UserTypeAccess;
import com.insa.repository.UserRepository;
import com.insa.repository.ComplaintTypeRepository;
import com.insa.repository.UserTypeAccessRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/administrator")
public class AdministratorController {

    private final UserRepository userRepository;
    private final ComplaintTypeRepository complaintTypeRepository;
    private final UserTypeAccessRepository userTypeAccessRepository;
    private final PasswordEncoder passwordEncoder;

    public AdministratorController(UserRepository userRepository,
                                   ComplaintTypeRepository complaintTypeRepository,
                                   UserTypeAccessRepository userTypeAccessRepository,
                                   PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.complaintTypeRepository = complaintTypeRepository;
        this.userTypeAccessRepository = userTypeAccessRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // GET ALL ADMINS
    // =========================
    @GetMapping("/admins")
    public List<User> getAllAdmins() {
        return userRepository.findByRole(User.Role.admin);
    }

    // =========================
    // CREATE ADMIN + ASSIGN DEPARTMENT
    // =========================
    @PostMapping("/admins")
    public User createAdmin(
            @RequestParam Long departmentId,
            @RequestBody User user) {

        if (departmentId == null) {
            throw new RuntimeException("Department is required");
        }

        // 🔹 Get department
        ComplaintType department = complaintTypeRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        // 🔹 Prepare user
        user.setRole(User.Role.admin);
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setActive(true);

        // 🔹 Save user
        User savedUser = userRepository.save(user);

        // 🔹 Create relation (THIS IS THE KEY PART 🔥)
        UserTypeAccess access = new UserTypeAccess();
        access.setUser(savedUser);
        access.setType(department);

        userTypeAccessRepository.save(access);

        return savedUser;
    }

    // =========================
    // DELETE ADMIN
    // =========================
    @DeleteMapping("/admins/{id}")
    public void deleteAdmin(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.admin) {
            throw new RuntimeException("Only focal person accounts can be deleted");
        }

        userRepository.delete(user);
    }

    // =========================
    // GET DEPARTMENTS
    // =========================
    @GetMapping("/departments")
    public List<ComplaintType> getDepartments() {
        return complaintTypeRepository.findAll();
    }

    // =========================
    // ADD DEPARTMENT
    // =========================
    @PostMapping("/departments")
    public ComplaintType addDepartment(@RequestBody ComplaintType type) {
        return complaintTypeRepository.save(type);
    }

    // =========================
    // DELETE DEPARTMENT
    // =========================
    @DeleteMapping("/departments/{id}")
    public void deleteDepartment(@PathVariable Long id) {
        complaintTypeRepository.deleteById(id);
    }
}