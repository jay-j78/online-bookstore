
package com.bookstore.online_bookstore;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponseDTO checkout(Principal principal) {
        return orderService.checkout(principal.getName());
    }

    @GetMapping
    public List<OrderResponseDTO> getOrderHistory(
            Principal principal) {
        return orderService.getOrderHistory(principal.getName());
    }

    @GetMapping("/{id}")
    public OrderResponseDTO getOrderById(
            @PathVariable Long id,
            Principal principal) {
        return orderService.getOrderById(
                principal.getName(), id);
    }
}
