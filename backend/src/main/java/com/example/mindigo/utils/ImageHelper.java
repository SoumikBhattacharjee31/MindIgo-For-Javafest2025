package com.example.mindigo.utils;

import com.example.mindigo.ImageUploads.ImageService;
import com.example.mindigo.user.repositories.UserRepository;
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
        user.setImage(imageAddress);
        System.out.println(imageAddress);
    }
}
