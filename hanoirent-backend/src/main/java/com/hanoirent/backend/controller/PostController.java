package com.hanoirent.backend.controller;

import com.hanoirent.backend.dto.CreatePostRequest;
import com.hanoirent.backend.entity.Post;
import com.hanoirent.backend.entity.District;
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
    @GetMapping("/landlord/{landlordId}")
    public ResponseEntity<List<Post>> getLandlordPost(@PathVariable Long landlordId){
        return ResponseEntity.ok(postService.getPostsByLandlord(landlordId));
    }
}
