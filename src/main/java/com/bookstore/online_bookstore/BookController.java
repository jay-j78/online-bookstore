
package com.bookstore.online_bookstore;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookRepository bookRepository;
    private final BookService bookService;

    public BookController(BookRepository bookRepository, BookService bookService) {
        this.bookRepository = bookRepository;
        this.bookService = bookService;
    }
    

    // Get all books
    @GetMapping
    public Page<BookResponseDTO> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return bookRepository.findAll(pageable)
                .map(book -> new BookResponseDTO(
                        book.getId(),
                        book.getTitle(),
                        book.getAuthor(),
                        book.getPrice()
                ));
    }


    // Add a new book
    @PostMapping
    public BookResponseDTO addBook(@Valid @RequestBody BookRequestDTO request) {

        Book savedBook = bookService.createBook(request);

        return new BookResponseDTO(
            savedBook.getId(),
            savedBook.getTitle(),
            savedBook.getAuthor(),
            savedBook.getPrice()
        );
    }


    // Get a book by ID
    @GetMapping("/{id:\\d+}")
    public BookResponseDTO getBookById(@PathVariable Long id) {

        Book book = bookService.getBookById(id);

        return new BookResponseDTO(
            book.getId(),
            book.getTitle(),
            book.getAuthor(),
            book.getPrice()
        );
    }


    // Update an existing bookp
    @PutMapping("/{id}")
    public BookResponseDTO updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequestDTO request) {

        Book updatedBook = bookService.updateBook(id, request);

        return new BookResponseDTO(
            updatedBook.getId(),
            updatedBook.getTitle(),
            updatedBook.getAuthor(),
            updatedBook.getPrice()
        );
    }


    // Delete a book
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public String deleteBook(@PathVariable Long id) {

        bookService.deleteBook(id);

        return "Book deleted successfully";
    }


    // Search books by title or author
    @GetMapping("/search")
    public List<BookResponseDTO> searchBooks(
            @RequestParam String keyword) {

        List<Book> books =
            bookRepository
                .findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
                    keyword, keyword);

        return books.stream()
            .map(book -> new BookResponseDTO(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getPrice()
            ))
            .toList();
    }

}