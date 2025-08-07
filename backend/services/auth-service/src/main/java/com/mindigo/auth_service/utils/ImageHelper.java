package com.mindigo.auth_service.utils;

import com.mindigo.auth_service.ImageUploads.ImageService;
import com.mindigo.auth_service.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ImageHelper {
    @Autowired
    public ImageService imageService;
    private final UserRepository repository;

    @Transactional
    @Async
    public void setImage(String email, MultipartFile file){
        var user = repository.findUserByEmail(email);
        if(user == null) return;
        String imageAddress = imageService.upload(file);
        user.setProfileImageUrl(imageAddress);
        System.out.println(imageAddress);
    }

    public void storeUserProfileImage(Long id, MultipartFile file) {
        String email = repository.findById(Math.toIntExact(id)).get().getEmail();
        setImage(email,file);
    }
}
