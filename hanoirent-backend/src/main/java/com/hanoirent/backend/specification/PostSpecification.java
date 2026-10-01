package com.hanoirent.backend.specification;

import com.hanoirent.backend.dto.PostFilterRequest;
import com.hanoirent.backend.entity.Post;
import com.hanoirent.backend.entity.PostStatus;
import com.hanoirent.backend.entity.Room;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class PostSpecification {

    public static Specification<Post> filterPosts(PostFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. MẶC ĐỊNH: Chỉ hiển thị các bài đăng ĐÃ ĐƯỢC DUYỆT (APPROVED)
            predicates.add(cb.equal(root.get("status"), PostStatus.APPROVED));

            // Join từ bảng Post sang bảng Room
            Join<Post, Room> roomJoin = root.join("room");

            // MẶC ĐỊNH: Chỉ lấy các phòng đang CÒN TRỐNG (isAvailable = true)
            predicates.add(cb.equal(roomJoin.get("isAvailable"), true));

            if (filter != null) {
                // 2. Lọc theo Khu vực & Loại hình
                if (filter.getDistrict() != null) {
                    predicates.add(cb.equal(roomJoin.get("district"), filter.getDistrict()));
                }
                if (StringUtils.hasText(filter.getWard())) {
                    predicates.add(cb.like(cb.lower(roomJoin.get("ward")), "%" + filter.getWard().toLowerCase() + "%"));
                }
                if (filter.getPropertyType() != null) {
                    predicates.add(cb.equal(roomJoin.get("propertyType"), filter.getPropertyType()));
                }

                // 3. Lọc theo Khoảng giá thuê phòng
                if (filter.getMinPrice() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(roomJoin.get("price"), filter.getMinPrice()));
                }
                if (filter.getMaxPrice() != null) {
                    predicates.add(cb.lessThanOrEqualTo(roomJoin.get("price"), filter.getMaxPrice()));
                }

                // 4. Lọc theo Đơn giá Dịch vụ Tối đa (Điện / Nước / Mạng)
                if (filter.getMaxElectricityPrice() != null) {
                    predicates.add(cb.lessThanOrEqualTo(roomJoin.get("electricityPrice"), filter.getMaxElectricityPrice()));
                }
                if (filter.getMaxWaterPrice() != null) {
                    predicates.add(cb.lessThanOrEqualTo(roomJoin.get("waterPrice"), filter.getMaxWaterPrice()));
                }
                if (filter.getMaxInternetPrice() != null) {
                    predicates.add(cb.lessThanOrEqualTo(roomJoin.get("internetPrice"), filter.getMaxInternetPrice()));
                }

                // 5. Lọc theo Tiện ích & Quy định
                if (filter.getMinParkingSlots() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(roomJoin.get("parkingSlots"), filter.getMinParkingSlots()));
                }
                if (Boolean.TRUE.equals(filter.getHasElectricVehicleCharging())) {
                    predicates.add(cb.equal(roomJoin.get("hasElectricVehicleCharging"), true));
                }
                if (Boolean.TRUE.equals(filter.getAllowPets())) {
                    predicates.add(cb.equal(roomJoin.get("allowPets"), true));
                }
                if (Boolean.TRUE.equals(filter.getFreeHours())) {
                    predicates.add(cb.equal(roomJoin.get("freeHours"), true));
                }
                if (Boolean.TRUE.equals(filter.getAirConditioner())) {
                    predicates.add(cb.equal(roomJoin.get("airConditioner"), true));
                }
                if (Boolean.TRUE.equals(filter.getWaterHeater())) {
                    predicates.add(cb.equal(roomJoin.get("waterHeater"), true));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}