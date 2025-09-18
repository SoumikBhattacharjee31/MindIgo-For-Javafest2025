package com.mindigo.auth_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "_user", indexes = {
        @Index(name = "idx_user_email", columnList = "email", unique = true),
        @Index(name = "idx_user_created_at", columnList = "created_at"),
        @Index(name = "idx_user_active_verified", columnList = "is_active, is_email_verified")
})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(name = "is_email_verified", nullable = false)
    @Builder.Default
    private Boolean isEmailVerified = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private Boolean isLocked = false;

    @Column(name = "failed_login_attempts")
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    // For OAuth2 integration
    @Column(name = "provider")
    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    @Column(name = "provider_id", length = 100)
    private String providerId;

    // Audit fields
    @CreationTimestamp
    @Column(name = "created_by", length = 100)
    private String createdBy;

    @UpdateTimestamp
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Counselor counselorDetails;

    // Update isEnabled() method to check counselor approval
    @Override
    public boolean isEnabled() {
        if (role == Role.COUNSELOR) {
            // A counselor must have their details present and be approved to be enabled.
            return isActive && isEmailVerified &&
                    counselorDetails != null && counselorDetails.isApproved();
        }
        // For other roles, the logic remains the same.
        return isActive && isEmailVerified;
    }

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserConnectedAccount> connectedAccounts = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserSession> activeSessions = new ArrayList<>();

    // Helper methods for connected accounts
    public void addConnectedAccount(UserConnectedAccount connectedAccount) {
        if (connectedAccounts == null) {
            connectedAccounts = new ArrayList<>();
        }
        connectedAccounts.add(connectedAccount);
        connectedAccount.setUser(this);
    }

    public void removeConnectedAccount(UserConnectedAccount connectedAccount) {
        if (connectedAccounts != null) {
            connectedAccounts.remove(connectedAccount);
            connectedAccount.setUser(null);
        }
    }

    // Helper methods for sessions
    public void addSession(UserSession session) {
        if (activeSessions == null) {
            activeSessions = new ArrayList<>();
        }
        activeSessions.add(session);
        session.setUser(this);
    }

    // Account status methods
    public boolean isAccountLocked() {
        if (!isLocked) return false;
        if (lockedUntil == null) return true;

        if (LocalDateTime.now().isAfter(lockedUntil)) {
            // Auto-unlock account if lock period has expired
            isLocked = false;
            lockedUntil = null;
            failedLoginAttempts = 0;
            return false;
        }
        return true;
    }

    public void lockAccount(int lockDurationMinutes) {
        this.isLocked = true;
        this.lockedUntil = LocalDateTime.now().plusMinutes(lockDurationMinutes);
    }

    public void unlockAccount() {
        this.isLocked = false;
        this.lockedUntil = null;
        this.failedLoginAttempts = 0;
    }

    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts = (this.failedLoginAttempts == null) ? 1 : this.failedLoginAttempts + 1;
    }

    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
    }

    public void markEmailAsVerified() {
        this.isEmailVerified = true;
        this.emailVerifiedAt = LocalDateTime.now();
    }

    public void updatePassword(String newPassword) {
        this.password = newPassword;
        this.passwordChangedAt = LocalDateTime.now();
    }

    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
        resetFailedLoginAttempts();
    }

    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));

        // Add additional permissions based on role if needed
        switch (role) {
            case ADMIN:
                authorities.add(new SimpleGrantedAuthority("PERMISSION_READ_ALL_USERS"));
                authorities.add(new SimpleGrantedAuthority("PERMISSION_MANAGE_USERS"));
                authorities.add(new SimpleGrantedAuthority("PERMISSION_DELETE_USERS"));
                break;
            case MODERATOR:
                authorities.add(new SimpleGrantedAuthority("PERMISSION_READ_USERS"));
                authorities.add(new SimpleGrantedAuthority("PERMISSION_MODERATE_CONTENT"));
                break;
            case USER:
                authorities.add(new SimpleGrantedAuthority("PERMISSION_READ_PROFILE"));
                authorities.add(new SimpleGrantedAuthority("PERMISSION_UPDATE_PROFILE"));
                break;
        }

        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        // You can add account expiration logic here if needed
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isAccountLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // You can add password expiration logic here if needed
        // For example: return passwordChangedAt.isAfter(LocalDateTime.now().minusDays(90));
        return true;
    }

//    @Override
//    public boolean isEnabled() {
//        return isActive && isEmailVerified;
//    }

    // Convenience methods with better naming
    public Boolean getIsEmailVerified() {
        return isEmailVerified;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public Boolean getIsLocked() {
        return isLocked;
    }

    // OAuth2 helper methods
    public boolean isOAuth2User() {
        return provider != null && provider != AuthProvider.LOCAL;
    }

    public boolean hasPassword() {
        return password != null && !password.isEmpty();
    }

    // Override toString to avoid sensitive data in logs
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", isEmailVerified=" + isEmailVerified +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                '}';
    }

    // Helper method for audit logging
    public String getAuditInfo() {
        return String.format("User[id=%d, email=%s, role=%s]", id, email, role);
    }
}