package com.hanoirent.backend.controller;

import com.hanoirent.backend.dto.CreatePostRequest;
import com.hanoirent.backend.entity.Post;
import com.hanoirent.backend.entity.District;
import com.hanoirent.backend.entity.PostStatus;
import com.hanoirent.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PostController {
    private final PostService postService;

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody CreatePostRequest request){
        try {
            Post createdPost = postService.createPost(request);
            return ResponseEntity.ok(createdPost);
        } catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Post>> getApprovedPosts(@RequestParam(required = false) District district){
        return ResponseEntity.ok(postService.getApprovedPosts(district));
    }

    // API Lấy chi tiết 1 bài đăng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Long id) {
        try {
            Post post = postService.getPostById(id);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/landlord/{landlordId}")
    public ResponseEntity<List<Post>> getLandlordPost(@PathVariable Long landlordId){
        return ResponseEntity.ok(postService.getPostsByLandlord(landlordId));
    }

    // API Lấy danh sách bài đăng chờ duyệt (PENDING)
    @GetMapping("/pending")
    public ResponseEntity<List<Post>> getPendingPosts() {
        return ResponseEntity.ok(postService.getPendingPosts());
    }

    // API Cập nhật trạng thái bài đăng (APPROVED / REJECTED)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePostStatus(@PathVariable Long id, @RequestParam PostStatus status) {
        try {
            Post updatedPost = postService.updatePostStatus(id, status);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Chủ trọ cập nhật trạng thái phòng (Đã cho thuê / Còn trống)
    @PutMapping("/{id}/availability")
    public ResponseEntity<?> updateAvailability(
            @PathVariable Long id,
            @RequestParam Long landlordId,
            @RequestParam(required = false) Boolean isAvailable) {
        try {
            Post updatedPost = postService.updateRoomAvailability(id, landlordId, isAvailable);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable Long id,
            @RequestParam Long landlordId,
            @RequestBody CreatePostRequest request) { // Hoặc DTO chỉnh sửa tương ứng
        try {
            // Bạn hãy tạo hàm updatePost trong PostService để xử lý
            Post updatedPost = postService.updatePost(id, landlordId, request);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
            @PathVariable Long id,
            @RequestParam(required = false) Long landlordId) {
        try {
            // Bạn hãy tạo hàm deletePost trong PostService để xử lý
            postService.deletePost(id, landlordId);
            return ResponseEntity.ok("Xóa bài đăng thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}