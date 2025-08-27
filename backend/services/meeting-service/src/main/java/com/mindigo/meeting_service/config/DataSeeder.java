package com.mindigo.meeting_service.config;

import com.mindigo.meeting_service.entity.CounselorSettings;
import com.mindigo.meeting_service.repository.CounselorSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDate;

@Configuration
public class DataSeeder {

    private void makeUser(CounselorSettingsRepository counselorSettingsRepository, long id) {
        if (counselorSettingsRepository.findByCounselorId(id).isEmpty()) {
            CounselorSettings counselorSettings = new CounselorSettings(id, true, true);
            counselorSettingsRepository.save(counselorSettings);
            System.out.println("Counselor settings created for id: " + String.valueOf(id));
        } else {
            System.out.println("Counselor settings already exists for id: " +  String.valueOf(id));
        }
    }

    @Bean
    public CommandLineRunner initAdminUser(CounselorSettingsRepository counselorSettingsRepository) {
        return args -> {
            for(long i=1;i<=10;i++){
                makeUser(counselorSettingsRepository,30+i*3);
            }
        };
    }
}
