
package com.bookstore.online_bookstore;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponseDTO(
        Long orderId,
        LocalDateTime orderDate,
        String status,
        double totalAmount,
        List<OrderItemResponseDTO> items) {
}
