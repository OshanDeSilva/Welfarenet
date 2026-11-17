package com.example.backend.repository;

import com.example.backend.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.util.List;
import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    Optional<Donation> findByPayment_PaymentId(Long paymentID);


    List<Donation> findByEvent_EventId(Integer eventId);

}
