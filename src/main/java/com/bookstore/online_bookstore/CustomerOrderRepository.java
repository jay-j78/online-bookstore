
package com.bookstore.online_bookstore;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository
        extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByUser_IdOrderByOrderDateDesc(Long userId);
}
