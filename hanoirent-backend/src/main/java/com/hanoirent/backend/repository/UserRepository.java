package com.hanoirent.backend.repository;

import com.hanoirent.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email); // kiểm tra xem có user nào tồn tại với email đó không, return true nếu có
}