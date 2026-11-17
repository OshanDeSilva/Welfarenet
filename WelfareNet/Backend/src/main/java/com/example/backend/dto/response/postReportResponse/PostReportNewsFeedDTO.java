package com.example.backend.dto.response.postReportResponse;

import com.example.backend.entity.Comment;
import com.example.backend.entity.Like;
import com.example.backend.entity.Member;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostReportNewsFeedDTO {

    private Integer postID;

    private Member author;

    private String content;

    private List<String> images;

    private LocalDate datePosted;

    private LocalTime timePosted;

    private Integer likeCount;

    private Integer commentCount;

}
