
package com.bookstore.online_bookstore;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final CustomerOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AppUserRepository userRepository;
    private final ShoppingCartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public OrderService(
            CustomerOrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            AppUserRepository userRepository,
            ShoppingCartRepository cartRepository,
            CartItemRepository cartItemRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional
    public OrderResponseDTO checkout(String email) {

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        ShoppingCart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart is empty"));

        List<CartItem> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException(
                    "Cannot checkout with an empty cart");
        }

        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PLACED");

        double total = 0.0;

        for (CartItem cartItem : cartItems) {
            Book book = cartItem.getBook();
            int quantity = cartItem.getQuantity();

            if (quantity <= 0) {
                throw new IllegalArgumentException(
                        "Invalid quantity in cart");
            }

            double price = book.getPrice();
            double subtotal = price * quantity;
            total += subtotal;
        }

        order.setTotalAmount(total);

        CustomerOrder savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = cartItems.stream()
                .map(cartItem -> {
                    Book book = cartItem.getBook();

                    OrderItem item = new OrderItem();
                    item.setOrder(savedOrder);
                    item.setBookId(book.getId());
                    item.setTitle(book.getTitle());
                    item.setAuthor(book.getAuthor());
                    item.setPrice(book.getPrice());
                    item.setQuantity(cartItem.getQuantity());
                    item.setSubtotal(
                            book.getPrice() * cartItem.getQuantity());

                    return item;
                })
                .toList();

        orderItemRepository.saveAll(orderItems);

        // Clear the cart only after the order and its items are saved.
        cartItemRepository.deleteByCartId(cart.getId());
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return toResponse(savedOrder, orderItems);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrderHistory(String email) {

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        return orderRepository
                .findByUser_IdOrderByOrderDateDesc(user.getId())
                .stream()
                .map(order -> {
                    List<OrderItem> items =
                            orderItemRepository.findByOrder_Id(order.getId());

                    return toResponse(order, items);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(
            String email, Long orderId) {

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        // Customers may access only their own orders.
        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Order not found");
        }

        List<OrderItem> items =
                orderItemRepository.findByOrder_Id(order.getId());

        return toResponse(order, items);
    }

    private OrderResponseDTO toResponse(
            CustomerOrder order, List<OrderItem> items) {

        List<OrderItemResponseDTO> itemDTOs = items.stream()
                .map(item -> new OrderItemResponseDTO(
                        item.getBookId(),
                        item.getTitle(),
                        item.getAuthor(),
                        item.getPrice(),
                        item.getQuantity(),
                        item.getSubtotal()))
                .toList();

        return new OrderResponseDTO(
                order.getId(),
                order.getOrderDate(),
                order.getStatus(),
                order.getTotalAmount(),
                itemDTOs);
    }
}
