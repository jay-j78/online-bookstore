
package com.bookstore.online_bookstore;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    public record AddToCartRequest(
            @NotNull @Positive Long bookId,
            @NotNull @Positive Integer quantity) {
    }

    public record UpdateCartItemRequest(
            @NotNull @Positive Integer quantity) {
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public CartItem addBook(
            @Valid @RequestBody AddToCartRequest request,
            Principal principal) {

        return cartService.addBook(
                principal.getName(),
                request.bookId(),
                request.quantity());
    }

    @GetMapping
    public List<CartItemResponseDTO> getCart(Principal principal) {
        return cartService.getCart(principal.getName());
    }

    @PutMapping("/items/{id}")
    public CartItemResponseDTO updateQuantity(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCartItemRequest request,
            Principal principal) {

        return cartService.updateQuantity(
                principal.getName(),
                id,
                request.quantity());
    }

    @DeleteMapping("/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeItem(
            @PathVariable Long id,
            Principal principal) {

        cartService.removeItem(principal.getName(), id);
    }

}
