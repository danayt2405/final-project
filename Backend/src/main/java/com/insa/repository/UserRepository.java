package com.insa.repository;

import com.insa.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    // Find user during login
    Optional<User> findByUsername(String username);

    // Get all focal persons (admins)
    List<User> findByRole(User.Role role);

}