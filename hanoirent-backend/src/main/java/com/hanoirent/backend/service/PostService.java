package com.hanoirent.backend.service;

import com.hanoirent.backend.dto.CreatePostRequest;
import com.hanoirent.backend.entity.*;
import com.hanoirent.backend.repository.PostRepository;
import com.hanoirent.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

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
                .electricityPrice(request.getElectricityPrice())
                .waterPrice(request.getWaterPrice())
                .internetPrice(request.getInternetPrice())
                .serviceFee(request.getServiceFee())
                .parkingSlots(request.getParkingSlots() != null ? request.getParkingSlots() : 0)
                .hasElectricVehicleCharging(Boolean.TRUE.equals(request.getHasElectricVehicleCharging()))
                .allowPets(Boolean.TRUE.equals(request.getAllowPets()))
                .freeHours(Boolean.TRUE.equals(request.getFreeHours()))
                .airConditioner(Boolean.TRUE.equals(request.getAirConditioner()))
                .waterHeater(Boolean.TRUE.equals(request.getWaterHeater()))
                .images(request.getImages() != null ? new java.util.ArrayList<>(request.getImages()) : new java.util.ArrayList<>())
                .videoUrl(request.getVideoUrl())
                .isAvailable(true)
                .landlord(landlord)
                .build();

        Post post = Post.builder()
                .room(room)
                .status(PostStatus.PENDING)
                .build();

        return postRepository.save(post);
    }

    // Lấy chi tiết 1 bài đăng theo ID
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng với mã ID: " + id));
    }

    public List<Post> getApprovedPosts(District district){
        if(district != null){
            return postRepository.findByStatusAndRoomDistrictAndRoomIsAvailableTrue(PostStatus.APPROVED, district);
        }
        return postRepository.findByStatusAndRoomIsAvailableTrue(PostStatus.APPROVED);
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

    // Chủ trọ cập nhật trạng thái phòng: Còn trống hoặc Đã cho thuê
    public Post updateRoomAvailability(Long postId, Long landlordId, Boolean isAvailable) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng!"));

        if (post.getRoom().getLandlord() == null || !post.getRoom().getLandlord().getId().equals(landlordId)) {
            throw new RuntimeException("Bạn không có quyền thay đổi trạng thái của phòng này!");
        }

        if (isAvailable != null) {
            post.getRoom().setIsAvailable(isAvailable);
        } else {
            boolean current = Boolean.TRUE.equals(post.getRoom().getIsAvailable());
            post.getRoom().setIsAvailable(!current);
        }

        return postRepository.save(post);
    }

    // Cập nhật thông tin bài đăng
    // 1. Thêm annotation @Transactional để đảm bảo JPA tự động flush mọi thay đổi của Post và Room vào DB
    @Transactional
    public Post updatePost(Long postId, Long landlordId, CreatePostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng!"));

        Room room = post.getRoom();
        if (room == null || room.getLandlord() == null || !room.getLandlord().getId().equals(landlordId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bài đăng này!");
        }

        // 2. Cập nhật các thông tin của Room
        if (request.getTitle() != null) room.setTitle(request.getTitle());
        if (request.getDescription() != null) room.setDescription(request.getDescription());
        if (request.getPrice() != null) room.setPrice(request.getPrice());
        if (request.getArea() != null) room.setArea(request.getArea());
        if (request.getAddress() != null) room.setAddress(request.getAddress());
        if (request.getDistrict() != null) room.setDistrict(request.getDistrict());
        if (request.getWard() != null) room.setWard(request.getWard());
        if (request.getElectricityPrice() != null) room.setElectricityPrice(request.getElectricityPrice());
        if (request.getWaterPrice() != null) room.setWaterPrice(request.getWaterPrice());
        if (request.getInternetPrice() != null) room.setInternetPrice(request.getInternetPrice());
        if (request.getServiceFee() != null) room.setServiceFee(request.getServiceFee());
        if (request.getParkingSlots() != null) room.setParkingSlots(request.getParkingSlots());
        if (request.getHasElectricVehicleCharging() != null) room.setHasElectricVehicleCharging(request.getHasElectricVehicleCharging());
        if (request.getAllowPets() != null) room.setAllowPets(request.getAllowPets());
        if (request.getFreeHours() != null) room.setFreeHours(request.getFreeHours());
        if (request.getAirConditioner() != null) room.setAirConditioner(request.getAirConditioner());
        if (request.getWaterHeater() != null) room.setWaterHeater(request.getWaterHeater());
        if (request.getImages() != null) room.setImages(new java.util.ArrayList<>(request.getImages()));
        if (request.getVideoUrl() != null) room.setVideoUrl(request.getVideoUrl());

        // 3. Đổi trạng thái Post về PENDING
        post.setStatus(PostStatus.PENDING);

        // Gán lại quan hệ hai chiều để JPA chắc chắn nhận biết sự thay đổi
        post.setRoom(room);

        // 4. Lưu lại vào Database
        return postRepository.save(post);
    }

    // Xóa bài đăng
    public void deletePost(Long postId, Long landlordId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng!"));

        if (landlordId == null || post.getRoom() == null || post.getRoom().getLandlord() == null || !post.getRoom().getLandlord().getId().equals(landlordId)) {
            throw new RuntimeException("Bạn không có quyền xóa bài đăng này!");
        }

        postRepository.delete(post);
    }
}