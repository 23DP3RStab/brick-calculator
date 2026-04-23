package com.backend.controller;

import com.backend.models.*;
import com.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PermissionRepository permissionRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public List<User> getUsers() { return userRepository.findAll(); }

    @PostMapping("/users")
    public User saveUser(@RequestBody User user) {
        if (user.getId() != null) {
            User existingUser = userRepository.findById(user.getId()).orElse(null);
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                user.setPassword(existingUser.getPassword());
            } else {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
        } else {
            if (user.getPassword() != null) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
        }
        
        if (user.getEnabled() == null) {
            user.setEnabled(true);
        }
        
        return userRepository.save(user);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) { userRepository.deleteById(id); }

    @GetMapping("/roles")
    public List<Role> getRoles() { return roleRepository.findAll(); }

    @PostMapping("/roles")
    public Role saveRole(@RequestBody Role role) { return roleRepository.save(role); }

    @DeleteMapping("/roles/{id}")
    public void deleteRole(@PathVariable Long id) { roleRepository.deleteById(id); }

    @GetMapping("/permissions")
    public List<Permission> getPermissions() { return permissionRepository.findAll(); }

    @PostMapping("/permissions")
    public Permission savePermission(@RequestBody Permission p) { return permissionRepository.save(p); }
}