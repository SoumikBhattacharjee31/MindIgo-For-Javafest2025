package com.mindigo.auth_service.models;


import jakarta.persistence.*;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class UserConnectedAccount{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String provider;
    private String providerId;
    private LocalDateTime connectedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public UserConnectedAccount(String provider, String providerId, User user) {
        this.provider = provider;
        this.providerId = providerId;
        this.connectedAt = LocalDateTime.now();
        this.user = user;
    }
}
