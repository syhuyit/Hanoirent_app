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

    // Lay danh sach bai dang cho Admin (PENDING hoặc tất cả)
    public List<Post> getPendingPosts() {
        return postRepository.findByStatus(PostStatus.PENDING);
    }

    // Admin duyệt hoặc từ chối bài đăng
    public Post updatePostStatus(Long postId, PostStatus status) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng!"));
        post.setStatus(status);
        return postRepository.save(post);
    }

    public List<Post> getPostsByLandlord(Long landlordId){
        return postRepository.findByRoomLandlordId(landlordId);
    }
}
