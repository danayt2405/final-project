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
    // GET ALL ADMINS + SUPER ADMINS
    // =========================
    @GetMapping("/admins")
    public List<User> getAllAdmins() {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == User.Role.admin
                          || u.getRole() == User.Role.super_admin)
                .toList();
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

        ComplaintType department = complaintTypeRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        user.setRole(User.Role.admin);
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setActive(true);

        User savedUser = userRepository.save(user);

        UserTypeAccess access = new UserTypeAccess();
        access.setUser(savedUser);
        access.setType(department);
        userTypeAccessRepository.save(access);

        return savedUser;
    }

    // =========================
    // UPDATE ADMIN / SUPER ADMIN
    // =========================
    @PutMapping("/admins/{id}")
    public User updateAdmin(@PathVariable Long id, @RequestBody User updatedUser) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.admin && user.getRole() != User.Role.super_admin) {
            throw new RuntimeException("Only admin/super_admin can be updated");
        }

        if (updatedUser.getUsername() != null) {
            user.setUsername(updatedUser.getUsername());
        }

        if (updatedUser.getFullName() != null) {
            user.setFullName(updatedUser.getFullName());
        }

        if (updatedUser.getEmail() != null) {
            user.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getPhone() != null) {
            user.setPhone(updatedUser.getPhone());
        }

        if (updatedUser.getPasswordHash() != null && !updatedUser.getPasswordHash().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(updatedUser.getPasswordHash()));
        }

        return userRepository.save(user);
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
    // GET ALL DEPARTMENTS
    // =========================
    @GetMapping("/departments")
    public List<ComplaintType> getDepartments() {
        return complaintTypeRepository.findAll();
    }

    // =========================
    // ADD DEPARTMENT + AUTO ASSIGN TO SUPER ADMINS ✅
    // =========================
    @PostMapping("/departments")
    public ComplaintType addDepartment(@RequestBody ComplaintType type) {

        // 1. Save department
        ComplaintType saved = complaintTypeRepository.save(type);

        // 2. Find ALL super admins
        List<User> superAdmins = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == User.Role.super_admin)
                .toList();

        // 3. Assign department to ALL super admins
        for (User superAdmin : superAdmins) {
            UserTypeAccess access = new UserTypeAccess();
            access.setUser(superAdmin);
            access.setType(saved);
            userTypeAccessRepository.save(access);
        }

        return saved;
    }

    // =========================
    // DELETE DEPARTMENT
    // =========================
    @DeleteMapping("/departments/{id}")
    public void deleteDepartment(@PathVariable Long id) {
        complaintTypeRepository.deleteById(id);
    }
}