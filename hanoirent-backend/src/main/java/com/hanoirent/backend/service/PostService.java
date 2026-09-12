package com.hanoirent.backend.service;

import com.hanoirent.backend.dto.CreatePostRequest;
import com.hanoirent.backend.entity.*;
import com.hanoirent.backend.repository.PostRepository;
import com.hanoirent.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public Post createPost(CreatePostRequest request){
        User landlord = userRepository.findById(request.getLandlordId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin chủ trọ hợp lệ!"));

        Room room = Room.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .area(request.getArea())
                .address(request.getAddress())
                .district(request.getDistrict())
                .ward(request.getWard())
                .isAvailable(true)
                .landlord(landlord)
                .build();

        Post post = Post.builder()
                .room(room)
                .status(PostStatus.PENDING)
                .build();

        return postRepository.save(post);
    }

    public List<Post> getApprovedPosts(District district){
        if(district != null){
            return postRepository.findByStatusAndRoomDistrict(PostStatus.APPROVED, district);
        }
        return postRepository.findByStatus(PostStatus.APPROVED);
    }

    public List<Post> getPostsByLandlord(Long landlordId){
        return postRepository.findByRoomLandlordId(landlordId);
    }
}
