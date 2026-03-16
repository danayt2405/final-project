package com.insa.repository;

import com.insa.entity.User;
import com.insa.entity.UserTypeAccess;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserTypeAccessRepository extends JpaRepository<UserTypeAccess, Long> {

    // For controllers using findByUser(User)
    List<UserTypeAccess> findByUser(User user);

    // For controllers/services using findByUserId(Long)
    List<UserTypeAccess> findByUserId(Long userId);
}
