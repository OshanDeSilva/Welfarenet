package com.example.backend.dto.response;


import com.example.backend.entity.Donation;
import com.example.backend.entity.EventIncome;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventIncomeResponseDto {
    private List<EventIncome> eventIncomes;
    private List<Donation> eventDonations;
    private BigDecimal totalEventIncome;

}
