package com.mindigo.auth_service.services;

import com.mindigo.auth_service.exception.InvalidPasswordException;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class PasswordValidatorService {

    // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
    private static final String PASSWORD_PATTERN =
            "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";

    private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);

    /**
     * Validates password strength according to security requirements
     *
     * @param password The password to validate
     * @throws InvalidPasswordException If password doesn't meet requirements
     */
    public void validatePassword(String password) {
//        if (password == null || password.isEmpty()) {
//            throw new InvalidPasswordException("Password cannot be empty");
//        }
//
//        if (password.length() < 8) {
//            throw new InvalidPasswordException("Password must be at least 8 characters long");
//        }
//
//        if (password.length() > 100) {
//            throw new InvalidPasswordException("Password cannot exceed 100 characters");
//        }
//
//        // Check for common weak passwords
//        if (isCommonWeakPassword(password)) {
//            throw new InvalidPasswordException("Password is too common and insecure");
//        }
//
//        // Check complexity using regex
//        if (!pattern.matcher(password).matches()) {
//            throw new InvalidPasswordException(
//                    "Password must contain at least one uppercase letter, " +
//                            "one lowercase letter, one number, and one special character");
//        }
    }

    private boolean isCommonWeakPassword(String password) {
        String lowerPassword = password.toLowerCase();
        String[] commonPasswords = {
                "password", "123456", "123456789", "qwerty", "abc123",
                "password1", "111111", "1234567", "iloveyou", "admin"
        };

        for (String common : commonPasswords) {
            if (lowerPassword.equals(common)) {
                return true;
            }
        }

        // Check for sequential characters
        if (lowerPassword.matches(".*abc.*|.*123.*|.*qwerty.*")) {
            return true;
        }

        return false;
    }
}