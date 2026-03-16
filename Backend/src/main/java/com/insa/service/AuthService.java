package com.insa.service;

import com.insa.dto.JwtResponse;
import com.insa.dto.LoginRequest;
import com.insa.entity.User;
import com.insa.entity.ComplaintType;
import com.insa.entity.UserTypeAccess;
import com.insa.repository.UserRepository;
import com.insa.repository.UserTypeAccessRepository;
import com.insa.repository.ComplaintTypeRepository;
import com.insa.config.JwtTokenProvider;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository repo;
    private final UserTypeAccessRepository accessRepo;
    private final ComplaintTypeRepository typeRepo;
    private final JwtTokenProvider jwt;
    private final BCryptPasswordEncoder encoder;

    public AuthService(UserRepository repo,
                       UserTypeAccessRepository accessRepo,
                       ComplaintTypeRepository typeRepo,
                       JwtTokenProvider jwt,
                       BCryptPasswordEncoder encoder) {
        this.repo = repo;
        this.accessRepo = accessRepo;
        this.typeRepo = typeRepo;
        this.jwt = jwt;
        this.encoder = encoder;
    }

    public JwtResponse login(LoginRequest request) {
        User user = repo.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!encoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwt.generateToken(user.getUsername());

        List<Long> allowedTypeIds = accessRepo.findByUserId(user.getId())
                .stream().map(a -> a.getType().getId()).collect(Collectors.toList());

        return new JwtResponse(token, user.getUsername(), user.getRole().name(), user.getId(), allowedTypeIds);
    }

    @Transactional
    public User registerAdmin(User user, String rawPassword, Long typeId) {
        user.setPasswordHash(encoder.encode(rawPassword));
        user.setRole(User.Role.admin);
        user.setActive(true);

        User saved = repo.save(user);

        if (typeId != null) {
            ComplaintType t = typeRepo.findById(typeId).orElseThrow(() -> new RuntimeException("Invalid type id"));
            UserTypeAccess uta = new UserTypeAccess();
            uta.setUser(saved);
            uta.setType(t);
            accessRepo.save(uta);
        }

        return saved;
    }

    @Transactional
    public User registerSuperAdmin(User user, String rawPassword) {
        user.setPasswordHash(encoder.encode(rawPassword));
        user.setRole(User.Role.super_admin);
        user.setActive(true);

        User saved = repo.save(user);

        // grant access to all types
        List<ComplaintType> all = typeRepo.findAll();
        for (ComplaintType t : all) {
            UserTypeAccess uta = new UserTypeAccess();
            uta.setUser(saved);
            uta.setType(t);
            accessRepo.save(uta);
        }
        return saved;
    }
}
