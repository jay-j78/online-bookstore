package com.bookstore.online_bookstore;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AppUser registerUser(RegisterRequestDTO request) {

        String email = request.getEmail().trim().toLowerCase();

        if (appUserRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists");
        }

        AppUser user = new AppUser();
        user.setName(request.getName().trim());
        user.setEmail(email);

        // Store a hash, never the original password.
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // New users must not be able to choose the administrator role.
        user.setRole("CUSTOMER");

        return appUserRepository.save(user);
    }
}
