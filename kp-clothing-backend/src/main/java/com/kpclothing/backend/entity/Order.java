package com.kpclothing.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    private String id; // e.g. ord-1001

    @Column(unique = true)
    private String orderCode; // e.g. KP0001 or KP-ORD-1001

    private String clientName;
    private String clientPhone;
    private String alternativePhone;

    // Structured 3-Step Checkout Address Fields
    @Column(length = 500)
    private String addressLine; // House / Flat / Street

    private String landmark;
    private String city;
    private String state;
    private String pincode;
    private String addressType = "Home"; // Home | Work

    @Column(length = 1000)
    private String clientAddress; // Combined address line for backward compatibility

    // Financial & Payment details
    @Column(nullable = true)
    private Double itemsTotal = 0.0;

    @Column(nullable = true)
    private Double deliveryFee = 0.0;

    @Column(nullable = true)
    private Double discountAmount = 0.0;

    @Column(nullable = true)
    private Double totalAmount = 0.0;

    private String paymentMethod = "COD"; // COD | UPI_WHATSAPP | RAZORPAY
    private String paymentStatus = "PENDING"; // PENDING | PAID | FAILED
    private String paymentId;
    private String razorpayOrderId;

    // Multi-item support
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
    @OrderColumn(name = "item_order")
    private List<OrderItem> items = new ArrayList<>();

    // Backward compatibility for single product orders
    private String productCode;
    private String productName;

    @Column(nullable = true)
    private Double productPrice = 0.0;

    @Column(length = 1000)
    private String productImage;

    @Column(nullable = true)
    private Integer quantity = 1;

    private String size = "Free Size";

    private Instant date = Instant.now();

    private String status = "pending"; // pending | processing | confirmed | shipped | completed | cancelled

    @Column(length = 2000)
    private String notes;

    private String customerId;

    public Order() {}

    // ---- Getters and setters ----
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientPhone() { return clientPhone; }
    public void setClientPhone(String clientPhone) { this.clientPhone = clientPhone; }

    public String getAlternativePhone() { return alternativePhone; }
    public void setAlternativePhone(String alternativePhone) { this.alternativePhone = alternativePhone; }

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

    public String getAddressType() { return addressType; }
    public void setAddressType(String addressType) { this.addressType = addressType; }

    public String getClientAddress() { return clientAddress; }
    public void setClientAddress(String clientAddress) { this.clientAddress = clientAddress; }

    public double getItemsTotal() { return itemsTotal != null ? itemsTotal : 0.0; }
    public void setItemsTotal(Double itemsTotal) { this.itemsTotal = itemsTotal != null ? itemsTotal : 0.0; }

    public double getDeliveryFee() { return deliveryFee != null ? deliveryFee : 0.0; }
    public void setDeliveryFee(Double deliveryFee) { this.deliveryFee = deliveryFee != null ? deliveryFee : 0.0; }

    public double getDiscountAmount() { return discountAmount != null ? discountAmount : 0.0; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount != null ? discountAmount : 0.0; }

    public double getTotalAmount() { return totalAmount != null ? totalAmount : 0.0; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount != null ? totalAmount : 0.0; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public double getProductPrice() { return productPrice != null ? productPrice : 0.0; }
    public void setProductPrice(Double productPrice) { this.productPrice = productPrice != null ? productPrice : 0.0; }

    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }

    public int getQuantity() { return quantity != null ? quantity : 1; }
    public void setQuantity(Integer quantity) { this.quantity = quantity != null ? quantity : 1; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Instant getDate() { return date; }
    public void setDate(Instant date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
}
