package com.example.backend.dto.response.postReportResponse;

import com.example.backend.entity.Member;
import com.example.backend.entity.NewsFeed;
import com.example.backend.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostReportResponseDTO {

    private Integer reportId;

    private Member reporter;

    private PostReportNewsFeedDTO post;

    private String reason;

    private LocalDate reportDate;

    private LocalTime reportTime;

    private ReportStatus reportStatus;

}
