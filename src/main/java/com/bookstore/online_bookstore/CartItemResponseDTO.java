package com.bookstore.online_bookstore;

public record CartItemResponseDTO(
        Long cartItemId,
        Long bookId,
        String title,
        String author,
        double price,
        int quantity,
        double subtotal) {
}
