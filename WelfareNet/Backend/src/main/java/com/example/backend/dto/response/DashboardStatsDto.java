package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    //Active Member Count
    private int active;

    //Total Member Count
    private int total;

    //Event Count this month
    private int eventCount;
}
