package com.kpclothing.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    @Column(unique = true)
    private String phone;

    private String alternativePhone;

    private Instant dateRegistered = Instant.now();

    @Column(length = 500)
    private String addressLine;

    private String landmark;
    private String city;
    private String state;
    private String pincode;

    @Column(length = 1000)
    private String fullAddress;

    private String email;

    @Column(nullable = true)
    private Integer orderCount = 0;

    @Column(nullable = true)
    private Double totalSpent = 0.0;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAlternativePhone() { return alternativePhone; }
    public void setAlternativePhone(String alternativePhone) { this.alternativePhone = alternativePhone; }

    public Instant getDateRegistered() { return dateRegistered; }
    public void setDateRegistered(Instant dateRegistered) { this.dateRegistered = dateRegistered; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getFullAddress() { return fullAddress; }
    public void setFullAddress(String fullAddress) { this.fullAddress = fullAddress; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public int getOrderCount() { return orderCount != null ? orderCount : 0; }
    public void setOrderCount(Integer orderCount) { this.orderCount = orderCount != null ? orderCount : 0; }

    public double getTotalSpent() { return totalSpent != null ? totalSpent : 0.0; }
    public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent != null ? totalSpent : 0.0; }
}
