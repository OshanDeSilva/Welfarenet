package com.example.backend.controller;

import com.example.backend.dto.response.DashboardStatsDto;
import com.example.backend.dto.response.EventIncomeResponseDto;
import com.example.backend.dto.response.IncomeResponseDto;
import com.example.backend.dto.response.TotalExpenseResponseDto;
import com.example.backend.entity.Expense;
import com.example.backend.services.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {
    private final ReportService reportService;

    public ReportsController(ReportService reportService){
        this.reportService = reportService;
    }

    @GetMapping("/annual-income")
    public ResponseEntity<List<IncomeResponseDto>> getAnnualReport(
            @RequestParam String year
    ){
        List<IncomeResponseDto> details = reportService.getIncomeForYear(year);
        return ResponseEntity.ok(details);
    }

    @GetMapping("/annual-expenses")
    public ResponseEntity<List<TotalExpenseResponseDto>> getAnnualExpenses(
            @RequestParam String year
    ){
        List<TotalExpenseResponseDto> details = reportService.getExpensesForYear(year);
        return ResponseEntity.ok(details);
    }

    @GetMapping("/event-income/{eventId}")
    public  ResponseEntity<EventIncomeResponseDto> getEventIncome(
            @PathVariable Integer eventId
    ){
        EventIncomeResponseDto details = reportService.getEventIncome(eventId);
        return ResponseEntity.ok(details);
    }

    @GetMapping("/event-expenses/{eventId}")
    public ResponseEntity<List<Expense>> getEventExpenses(
            @PathVariable Integer eventId
    ){
        List<Expense> expenses = reportService.getEventExpenses(eventId);
        return ResponseEntity.ok(expenses);

    }

    @GetMapping("/totalCounts")
    public ResponseEntity<DashboardStatsDto> memberCounts(){
        DashboardStatsDto response = reportService.getTotalCounts();
        return ResponseEntity.ok(response);
    }
}
