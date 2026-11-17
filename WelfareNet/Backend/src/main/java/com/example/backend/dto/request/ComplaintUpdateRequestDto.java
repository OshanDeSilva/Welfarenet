package com.example.backend.dto.request;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class ComplaintUpdateRequestDto {
    private Integer complaintId;
    private String response;

}
