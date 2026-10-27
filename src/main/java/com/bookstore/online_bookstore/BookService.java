package com.bookstore.online_bookstore;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final CartItemRepository cartItemRepository;

    public BookService(
            BookRepository bookRepository,
            CartItemRepository cartItemRepository) {
        this.bookRepository = bookRepository;
        this.cartItemRepository = cartItemRepository;
    }

    // Get a book by ID
    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Book not found with ID: " + id));
    }

    // Add a new book
    public Book createBook(BookRequestDTO request) {
        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setPrice(request.getPrice());

        return bookRepository.save(book);
    }

    // Update an existing book
    public Book updateBook(Long id, BookRequestDTO request) {
        Book existingBook = getBookById(id);

        existingBook.setTitle(request.getTitle());
        existingBook.setAuthor(request.getAuthor());
        existingBook.setPrice(request.getPrice());

        return bookRepository.save(existingBook);
    }

    // Delete a book and remove its shopping-cart references
    @Transactional
    public void deleteBook(Long id) {
        Book book = getBookById(id);

        List<CartItem> cartItems = cartItemRepository.findAll()
                .stream()
                .filter(item -> item.getBook() != null
                        && item.getBook().getId().equals(id))
                .toList();

        cartItemRepository.deleteAll(cartItems);
        bookRepository.delete(book);
    }
}
