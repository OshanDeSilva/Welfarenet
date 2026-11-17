package com.example.backend.services;

import com.example.backend.dto.response.DashboardStatsDto;
import com.example.backend.dto.response.EventIncomeResponseDto;
import com.example.backend.dto.response.IncomeResponseDto;
import com.example.backend.dto.response.TotalExpenseResponseDto;
import com.example.backend.entity.Donation;
import com.example.backend.entity.Event;
import com.example.backend.entity.EventIncome;
import com.example.backend.entity.Expense;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final EventRepository eventRepository;
    private final DonationRepository donationRepository;
    private final MemberRepository memberRepository;
    private final EventService eventService;

    public List<IncomeResponseDto> getIncomeForYear(String stringYear){

        int year = Integer.parseInt(stringYear);
        LocalDate startDate = LocalDate.of(year,1,1);
        LocalDate endDate = LocalDate.of(year,12,31);

        List<Object[]> payments = paymentRepository.getMonthlyMembershipTotal(startDate,endDate);
        List<Object[]> donations = paymentRepository.getMonthlyDonationTotal(startDate,endDate);

        Map<Integer,Double> paymentMap = new HashMap<>();
        for(Object[] row:payments){
            Integer month = (Integer) row[0];
            Double total = (Double) row[1];
            paymentMap.put(month,total);
        }

        Map<Integer,Double> donationMap = new HashMap<>();
        for(Object[] row:donations){
            Integer month = (Integer) row[0];
            Double total = (Double) row[1];
            donationMap.put(month,total);
        }

        List<IncomeResponseDto> report = new ArrayList<>();

        for(int month=1;month<=12;month++){
            IncomeResponseDto dto = new IncomeResponseDto();
            dto.setMonth(Month.of(month).name());//Month Name
            dto.setMembership(paymentMap.getOrDefault(month,0.0));
            dto.setDonations(donationMap.getOrDefault(month,0.0));
            dto.setTotal(dto.getDonations()+ dto.getMembership());

            report.add(dto);
        }
        return report;
    }

    public List<TotalExpenseResponseDto> getExpensesForYear(String stringYear){
        int year = Integer.parseInt(stringYear);
        LocalDate startDate = LocalDate.of(year,1,1);
        LocalDate endDate = LocalDate.of(year,12,31);

        List<Object[]> eventExpenses = expenseRepository.getMonthlyEventExpensesTotal(startDate,endDate);
        List<Object[]> maintenanceExpenses = expenseRepository.getMonthlyMaintenanceExpensesTotal(startDate,endDate);
        List<Object[]> otherExpenses = expenseRepository.getMonthlyOtherExpenses(startDate,endDate);

        Map<Integer,Double> eventMap = new HashMap<>();
        for(Object[] row: eventExpenses){
            Integer month = (Integer) row[0];
            Double total = (Double) row[1];
            eventMap.put(month,total);
        }
        Map<Integer,Double> maintenanceMap = new HashMap<>();
        for(Object[] row:maintenanceExpenses){
            Integer month = (Integer) row[0];
            Double total = (Double) row[1];
            maintenanceMap.put(month,total);
        }

        Map<Integer,Double> otherMap = new HashMap<>();
        for(Object[] row:otherExpenses){
            Integer month = (Integer) row[0];
            Double total = (Double) row[1];
            otherMap.put(month,total);
        }

        List<TotalExpenseResponseDto> response = new ArrayList<>();

        for(int month=1;month<=12;month++){
            TotalExpenseResponseDto dto = new TotalExpenseResponseDto();
            dto.setMonth(Month.of(month).name());
            dto.setEventExpenseTotal(eventMap.getOrDefault(month,0.0));
            dto.setMaintenanceExpenseTotal(maintenanceMap.getOrDefault(month,0.0));
            dto.setOtherExpensesTotal(otherMap.getOrDefault(month,0.0));

            response.add(dto);
        }

        return response;
    }

    public EventIncomeResponseDto getEventIncome(Integer eventId){
        Event event =  eventRepository.findByEventId(eventId);

        EventIncomeResponseDto response = new EventIncomeResponseDto();

        List<EventIncome> eventIncomes = event.getEventIncomes();
        List<Donation> eventDonations = donationRepository.findByEvent_EventId(eventId);

        BigDecimal totalEventIncome = new BigDecimal("0");

        for (EventIncome income : eventIncomes) {
            totalEventIncome = totalEventIncome.add(income.getAmount());
        }

        for(Donation donation : eventDonations){
            totalEventIncome = totalEventIncome.add(new BigDecimal(donation.getPayment().getAmount()));
        }

        response.setEventIncomes(eventIncomes);
        response.setEventDonations(eventDonations);
        response.setTotalEventIncome(totalEventIncome);

        return response;
    }

    public List<Expense> getEventExpenses(Integer eventId){
        return expenseRepository.findByEvent_EventId(eventId);
    }

    public DashboardStatsDto getTotalCounts(){
        DashboardStatsDto status = new DashboardStatsDto();

        int activeCount = memberRepository.activeCount();

        int totalCount = memberRepository.totalCount();

        LocalDate today = LocalDate.now();

        List<Event> eventList = eventService.getEventsByMonth(today.getYear(),today.getMonthValue());

        status.setActive(activeCount);
        status.setTotal(totalCount);
        status.setEventCount(eventList.size());
        return status;

    }
}
