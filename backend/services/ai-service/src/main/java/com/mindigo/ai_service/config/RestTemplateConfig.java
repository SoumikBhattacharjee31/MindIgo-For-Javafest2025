package com.mindigo.ai_service.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;


@Configuration
@Slf4j
public class RestTemplateConfig {

    @Value("${rest.template.connection-timeout:15000}")
    private int connectionTimeout;

    @Value("${rest.template.read-timeout:60000}")
    private int readTimeout;

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectionTimeout);
        factory.setReadTimeout(readTimeout);

        RestTemplate restTemplate = new RestTemplate(factory);

        log.info("RestTemplate configured with connection timeout: {}ms, read timeout: {}ms",
                connectionTimeout, readTimeout);

        return restTemplate;
    }
}