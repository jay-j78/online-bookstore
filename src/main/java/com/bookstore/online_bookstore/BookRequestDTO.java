package com.bookstore.online_bookstore;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class BookRequestDTO {

    @NotBlank(message = "Book title cannot be empty")
    private String title;

    @NotBlank(message = "Author name cannot be empty")
    private String author;

    @Positive(message = "Price must be greater than zero")
    private double price;

    public BookRequestDTO() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
