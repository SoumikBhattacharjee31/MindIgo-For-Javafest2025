package com.example.mindigo.utils;
import java.util.Random;

public class RandomOTPGenerator {

    public static int generateRandom6DigitNumber() {
        Random random = new Random();
        return random.nextInt(900000) + 100000;
    }
}
