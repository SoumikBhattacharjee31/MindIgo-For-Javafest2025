package com.mindigo.game_service.controller;

import com.mindigo.game_service.dto.response.GridResponse;
import com.mindigo.game_service.dto.response.TestResponse;
import com.mindigo.game_service.exceptions.InvalidParameterException;
import com.mindigo.game_service.service.InfinityLoopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/game")
public class GameController {
    @Autowired
    private InfinityLoopService infinityLoopService;

    @GetMapping("/test")
    public ResponseEntity<TestResponse> testingPath(){
        TestResponse test = TestResponse
                .builder()
                .api("api/v1/game/test")
                .status("UP").build();
        return ResponseEntity.ok(test);
    }

    @GetMapping("/infinity-loop/get-grid")
    public ResponseEntity<GridResponse> getInfinityLoopGrid(@RequestParam(defaultValue = "5") int size){
        try{
           GridResponse response = infinityLoopService.getGrid(size);
           return ResponseEntity.ok(response);
        } catch (InvalidParameterException e) {
            return ResponseEntity.badRequest().body(GridResponse.builder().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(GridResponse.builder().build());
        }
    }
}
