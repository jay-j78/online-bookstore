package com.bookstore.online_bookstore;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {

List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
    String title, String author);

}
