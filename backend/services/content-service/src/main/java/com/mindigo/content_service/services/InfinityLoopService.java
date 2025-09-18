package com.mindigo.content_service.services;

import com.mindigo.content_service.dto.game.GridResponse;
import com.mindigo.content_service.exceptions.game.InvalidParameterException;
import com.mindigo.content_service.utils.GameUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InfinityLoopService {

    public GridResponse getGrid(int size){
        GameUtils gameUtils = new GameUtils();
        if(size!=5){
            throw new InvalidParameterException("Grid Size Must be 5");
        }
        List<List<List<Integer>>> grid = gameUtils.generateGrid(5,5);

        return GridResponse
                .builder()
                .grid(grid)
                .build();
    }

}
