package com.bookstore.online_bookstore;

public class BookResponseDTO {
    
    private final Long id;
    private final String title;
    private final String author;
    private final double price;


    public BookResponseDTO(Long id, String title, String author, double price) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public double getPrice() {
        return price;
    }
}

