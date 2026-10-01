package com.hanoirent.backend.service;

import com.hanoirent.backend.dto.CreatePostRequest;
import com.hanoirent.backend.dto.PostFilterRequest;
import com.hanoirent.backend.entity.*;
import com.hanoirent.backend.repository.PostRepository;
import com.hanoirent.backend.repository.UserRepository;
import com.hanoirent.backend.specification.PostSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    // BỘ LỌC TÌM KIẾM NÂNG CAO VỚI PHÂN TRANG
    public Page<Post> searchPosts(PostFilterRequest filter) {
        // Đảm bảo không bị null pointer ở trang và số lượng bản ghi
        int page = (filter != null && filter.getPage() != null) ? filter.getPage() : 0;
        int size = (filter != null && filter.getSize() != null) ? filter.getSize() : 10;

        // Sắp xếp bài đăng mới nhất lên đầu (theo id giảm dần)
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        // Tạo dynamic specification
        Specification<Post> spec = PostSpecification.filterPosts(filter);

        return postRepository.findAll(spec, pageable);
    }

    public Post createPost(CreatePostRequest request){
        User landlord = userRepository.findById(request.getLandlordId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin chủ trọ hợp lệ!"));

        Room room = Room.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .propertyType(request.getPropertyType())
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

    // Lấy danh sách bài đăng cho Admin (PENDING hoặc tất cả)
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
    @Transactional
    public Post updatePost(Long postId, Long landlordId, CreatePostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng!"));

        Room room = post.getRoom();
        if (room == null || room.getLandlord() == null || !room.getLandlord().getId().equals(landlordId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bài đăng này!");
        }

        // Cập nhật các thông tin của Room
        if (request.getTitle() != null) room.setTitle(request.getTitle());
        if (request.getDescription() != null) room.setDescription(request.getDescription());
        if (request.getPropertyType() != null) room.setPropertyType(request.getPropertyType());
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

        // Đổi trạng thái Post về PENDING
        post.setStatus(PostStatus.PENDING);

        post.setRoom(room);
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