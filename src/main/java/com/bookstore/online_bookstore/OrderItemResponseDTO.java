
package com.bookstore.online_bookstore;

public record OrderItemResponseDTO(
        Long bookId,
        String title,
        String author,
        double price,
        int quantity,
        double subtotal) {
}
