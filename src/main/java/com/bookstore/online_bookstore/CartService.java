
package com.bookstore.online_bookstore;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    private final ShoppingCartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AppUserRepository userRepository;
    private final BookRepository bookRepository;

    public CartService(
            ShoppingCartRepository cartRepository,
            CartItemRepository cartItemRepository,
            AppUserRepository userRepository,
            BookRepository bookRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    @Transactional
    public CartItem addBook(String email, Long bookId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        ShoppingCart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    ShoppingCart newCart = new ShoppingCart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        CartItem item = cartItemRepository
                .findByCartIdAndBookId(cart.getId(), bookId)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setBook(book);
                    newItem.setQuantity(0);
                    return newItem;
                });

        item.setQuantity(item.getQuantity() + quantity);
        cart.setUpdatedAt(LocalDateTime.now());

        cartRepository.save(cart);
        return cartItemRepository.save(item);
    }


    @Transactional(readOnly = true)
    public List<CartItemResponseDTO> getCart(String email) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ShoppingCart cart = cartRepository.findByUserId(user.getId())
                .orElse(null);

        if (cart == null) {
            return List.of();
        }

        return cartItemRepository.findByCartId(cart.getId())
                .stream()
                .map(item -> {
                    Book book = bookRepository.findById(item.getBook().getId())
                            .orElseThrow(() -> new IllegalArgumentException("Book not found"));

                    double price = book.getPrice();
                    int quantity = item.getQuantity();

                    return new CartItemResponseDTO(
                            item.getId(),
                            book.getId(),
                            book.getTitle(),
                            book.getAuthor(),
                            price,
                            quantity,
                            price * quantity);
                })
                .toList();
    }
 
    @Transactional
    public CartItemResponseDTO updateQuantity(
            String email, Long itemId, Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        ShoppingCart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart not found"));

        CartItem item = cartItemRepository
                .findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart item not found"));

        item.setQuantity(quantity);
        cart.setUpdatedAt(LocalDateTime.now());

        cartRepository.save(cart);
        CartItem savedItem = cartItemRepository.save(item);

        Book book = bookRepository.findById(savedItem.getBook().getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Book not found"));

        double price = book.getPrice();

        return new CartItemResponseDTO(
                savedItem.getId(),
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                price,
                savedItem.getQuantity(),
                price * savedItem.getQuantity());
    }
 
    
    @Transactional
    public void removeItem(String email, Long itemId) {

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        ShoppingCart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart not found"));

        CartItem item = cartItemRepository
                .findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart item not found"));

        cartItemRepository.delete(item);

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

}