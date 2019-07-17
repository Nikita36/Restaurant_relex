package ru.relex.restaurant.web.api;


import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import ru.relex.restaurant.service.DTO.WaiterOrdersDto;
import ru.relex.restaurant.service.impl.WaiterOrdersService;

import java.util.List;

@RestController
@RequestMapping(value = "/waiterOrders")
public class WaiterOrdersController {
    private final WaiterOrdersService waiterOrdersService;

    public WaiterOrdersController(WaiterOrdersService waiterOrdersService) {
        this.waiterOrdersService = waiterOrdersService;
    }

    @GetMapping("{id}")
    public WaiterOrdersDto getByid(@PathVariable("id") int id){
        WaiterOrdersDto ordersDto = waiterOrdersService.getById(id);
        if (ordersDto == null){
            return null;
        }
        return ordersDto;
    }
    @GetMapping("/getAll")
    public List<WaiterOrdersDto> getAll(){
        return waiterOrdersService.getAll();
    }
    @PostMapping
    public boolean insert(@RequestBody WaiterOrdersDto waiterOrdersDto){
        boolean IsDone = waiterOrdersService.insert(waiterOrdersDto);
        return IsDone;

    }
    @PutMapping
    public WaiterOrdersDto update(@PathVariable WaiterOrdersDto waiterOrdersDto){
        WaiterOrdersDto updatedOrders = waiterOrdersService.update(waiterOrdersDto);
        if (updatedOrders == null){
            return null;
        }
        return updatedOrders;
    }
}
