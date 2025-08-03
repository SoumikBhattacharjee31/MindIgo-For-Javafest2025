package com.mindigo.auth_service.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")

public class User{ //implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    private String email;
    private String password;
    private Date dob;
    private String image;

    private Boolean valid;
    @Enumerated(EnumType.STRING)
    private Role role;

//    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER)
//    private List<UserConnectedAccount> connectedAccounts = new ArrayList<>();
//
//    public User (OAuth2User oAuth2User) {
//        this.email = oAuth2User.getAttribute("email");
//        this.name = oAuth2User.getAttribute("name");
//        this.role = Role.USER;
//        this.valid = true;
//    }
//
//    public void addConnectedAccount(UserConnectedAccount connectedAccount) {
//        connectedAccounts.add(connectedAccount);
////    }
//
//    @Override
//    public Collection<? extends GrantedAuthority> getAuthorities() {
//        return List.of(new SimpleGrantedAuthority(role.name()));
//    }
//
//    @Override
//    public String getPassword() {
//        return password ;
//    }
//
//    @Override
//    public String getUsername() {
//        return email;
//    }
//
//    @Override
//    public boolean isAccountNonExpired() {
//        return true;
//    }
//
//    @Override
//    public boolean isAccountNonLocked() {
//        return true;
//    }
//
//    @Override
//    public boolean isCredentialsNonExpired() {
//        return true;
//    }
//
//    @Override
//    public boolean isEnabled() {
//        return true;
//    }
}

