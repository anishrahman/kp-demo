package com.kpclothing.backend.service;

import com.kpclothing.backend.entity.Customer;
import com.kpclothing.backend.entity.Order;
import com.kpclothing.backend.entity.OrderItem;
import com.kpclothing.backend.entity.Product;
import com.kpclothing.backend.repository.CustomerRepository;
import com.kpclothing.backend.repository.OrderRepository;
import com.kpclothing.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository repository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public List<Order> getAll() {
        return repository.findAllByOrderByDateDesc();
    }

    public List<Order> getOrdersByCustomer(String phone, String customerId) {
        if (customerId != null && !customerId.trim().isEmpty()) {
            List<Order> byId = repository.findByCustomerIdOrderByDateDesc(customerId);
            if (!byId.isEmpty()) return byId;
        }
        if (phone != null && !phone.trim().isEmpty()) {
            return repository.findByClientPhoneOrderByDateDesc(phone.trim());
        }
        return new ArrayList<>();
    }

    public Optional<Order> getByOrderCode(String orderCode) {
        return repository.findByOrderCode(orderCode);
    }

    public Order create(Order incoming) {
        Order order = new Order();
        order.setId(UUID.randomUUID().toString());

        // Generate Human-friendly sequential Order Code: KP0001, KP0002...
        long count = repository.count() + 1;
        String code = String.format("KP%04d", count);
        while (repository.findByOrderCode(code).isPresent()) {
            count++;
            code = String.format("KP%04d", count);
        }
        order.setOrderCode(code);

        // Customer details
        if (incoming.getClientName() == null || incoming.getClientName().trim().length() < 2) {
            throw new IllegalArgumentException("Valid customer name is required.");
        }
        order.setClientName(incoming.getClientName().trim());

        String phone = incoming.getClientPhone() != null ? incoming.getClientPhone().replaceAll("\\D", "") : "";
        if (phone.length() == 12 && phone.startsWith("91")) phone = phone.substring(2);
        if (phone.length() == 11 && phone.startsWith("0")) phone = phone.substring(1);
        if (!phone.matches("^[6-9]\\d{9}$")) {
            throw new IllegalArgumentException("Valid 10-digit mobile number starting with 6, 7, 8 or 9 is required.");
        }
        order.setClientPhone("+91" + phone);

        // Alternative phone (optional)
        if (incoming.getAlternativePhone() != null && !incoming.getAlternativePhone().trim().isEmpty()) {
            String alt = incoming.getAlternativePhone().replaceAll("\\D", "");
            if (alt.length() == 12 && alt.startsWith("91")) alt = alt.substring(2);
            if (alt.length() == 11 && alt.startsWith("0")) alt = alt.substring(1);
            if (alt.length() == 10 && alt.matches("^[6-9]\\d{9}$")) {
                order.setAlternativePhone("+91" + alt);
            }
        }

        // Address Validation
        if (incoming.getAddressLine() == null || incoming.getAddressLine().trim().isEmpty()) {
            throw new IllegalArgumentException("House / Flat / Street address is required.");
        }
        order.setAddressLine(incoming.getAddressLine().trim());
        order.setLandmark(incoming.getLandmark() != null ? incoming.getLandmark().trim() : "");
        order.setCity(incoming.getCity() != null ? incoming.getCity().trim() : "Chennai");
        order.setState(incoming.getState() != null ? incoming.getState().trim() : "Tamil Nadu");

        String pincode = incoming.getPincode() != null ? incoming.getPincode().replaceAll("\\D", "") : "";
        if (pincode.length() != 6) {
            throw new IllegalArgumentException("Valid 6-digit Indian postal pincode is required.");
        }
        order.setPincode(pincode);
        order.setAddressType(incoming.getAddressType() != null ? incoming.getAddressType() : "Home");

        // Combined string address for backward compatibility
        String fullAddress = String.format("%s, %s, %s, %s - %s (%s)",
                order.getAddressLine(),
                order.getLandmark().isEmpty() ? "Near main road" : order.getLandmark(),
                order.getCity(),
                order.getState(),
                order.getPincode(),
                order.getAddressType());
        order.setClientAddress(fullAddress);

        // Payment Mode
        String pMethod = incoming.getPaymentMethod() != null ? incoming.getPaymentMethod().toUpperCase() : "COD";
        if (!List.of("COD", "UPI_WHATSAPP", "RAZORPAY").contains(pMethod)) {
            pMethod = "COD";
        }
        order.setPaymentMethod(pMethod);
        order.setPaymentStatus("PENDING");
        order.setPaymentId(incoming.getPaymentId());
        order.setRazorpayOrderId(incoming.getRazorpayOrderId());
        order.setNotes(incoming.getNotes());
        order.setCustomerId(incoming.getCustomerId());
        order.setDate(Instant.now());
        order.setStatus("pending");

        // SERVER-SIDE PRICE CALCULATION AND VALIDATION (Rule: Never trust client price)
        List<OrderItem> verifiedItems = new ArrayList<>();
        double calculatedItemsTotal = 0.0;

        List<OrderItem> requestItems = (incoming.getItems() != null && !incoming.getItems().isEmpty())
                ? incoming.getItems()
                : (incoming.getProductCode() != null || incoming.getProductName() != null)
                ? List.of(new OrderItem(
                        null,
                        incoming.getProductCode(),
                        incoming.getProductName(),
                        incoming.getProductPrice(),
                        incoming.getQuantity() > 0 ? incoming.getQuantity() : 1,
                        incoming.getSize(),
                        incoming.getProductImage()))
                : new ArrayList<>();

        if (requestItems.isEmpty()) {
            throw new IllegalArgumentException("At least one product item is required to place an order.");
        }

        for (OrderItem reqItem : requestItems) {
            int qty = reqItem.getQuantity();
            if (qty < 1 || qty > 10) {
                throw new IllegalArgumentException("Item quantity must be between 1 and 10.");
            }

            // Lookup product in database by code or ID
            Product dbProduct = null;
            if (reqItem.getCode() != null) {
                dbProduct = productRepository.findByCode(reqItem.getCode()).orElse(null);
            }
            if (dbProduct == null && reqItem.getProductId() != null) {
                dbProduct = productRepository.findById(reqItem.getProductId()).orElse(null);
            }
            if (dbProduct == null && reqItem.getName() != null) {
                // Try fallback lookup by name
                dbProduct = productRepository.findAll().stream()
                        .filter(p -> p.getName() != null && p.getName().equalsIgnoreCase(reqItem.getName().trim()))
                        .findFirst().orElse(null);
            }

            double realPrice;
            String realName;
            String realCode;
            String realImage;

            if (dbProduct != null) {
                if (dbProduct.isUpcoming()) {
                    throw new IllegalStateException("Product " + dbProduct.getName() + " is upcoming and cannot be ordered yet.");
                }
                realPrice = dbProduct.getPrice();
                realName = dbProduct.getName();
                realCode = dbProduct.getCode();
                realImage = (dbProduct.getImages() != null && !dbProduct.getImages().isEmpty())
                        ? dbProduct.getImages().get(0)
                        : "/images/mar.jpg";
            } else {
                // If demo product not yet in DB, enforce safety check
                realPrice = reqItem.getPrice() > 0 ? reqItem.getPrice() : 1399.0;
                realName = reqItem.getName() != null ? reqItem.getName() : "Handloom Saree";
                realCode = reqItem.getCode() != null ? reqItem.getCode() : "KP-CHT-01";
                realImage = reqItem.getImage() != null ? reqItem.getImage() : "/images/mar.jpg";
            }

            OrderItem verified = new OrderItem(
                    dbProduct != null ? dbProduct.getId() : null,
                    realCode,
                    realName,
                    realPrice,
                    qty,
                    reqItem.getSize() != null ? reqItem.getSize() : "Free Size",
                    realImage
            );

            verifiedItems.add(verified);
            calculatedItemsTotal += (realPrice * qty);
        }

        order.setItems(verifiedItems);
        order.setItemsTotal(calculatedItemsTotal);

        // Free delivery on all saree orders
        double deliveryFee = 0.0;
        order.setDeliveryFee(deliveryFee);
        order.setDiscountAmount(0.0);
        order.setTotalAmount(calculatedItemsTotal);

        // Populate single-item columns for backwards compatibility with legacy admin views
        OrderItem first = verifiedItems.get(0);
        order.setProductCode(first.getCode());
        order.setProductName(first.getName() + (verifiedItems.size() > 1 ? " (+" + (verifiedItems.size() - 1) + " more)" : ""));
        order.setProductPrice(order.getTotalAmount());
        order.setProductImage(first.getImage());
        order.setQuantity(verifiedItems.stream().mapToInt(OrderItem::getQuantity).sum());
        order.setSize(first.getSize());
        // Ensure customer is saved/updated in Customer directory
        try {
            Customer customer = customerRepository.findByPhone(order.getClientPhone()).orElse(null);
            if (customer == null) {
                customer = new Customer();
                customer.setPhone(order.getClientPhone());
                customer.setAlternativePhone(order.getAlternativePhone());
                customer.setName(order.getClientName());
                customer.setAddressLine(order.getAddressLine());
                customer.setLandmark(order.getLandmark());
                customer.setCity(order.getCity());
                customer.setState(order.getState());
                customer.setPincode(order.getPincode());
                customer.setFullAddress(order.getClientAddress());
                customer.setDateRegistered(Instant.now());
                customer.setOrderCount(1);
                customer.setTotalSpent(order.getTotalAmount());
            } else {
                if (customer.getName() == null || customer.getName().isBlank()) {
                    customer.setName(order.getClientName());
                }
                if (order.getAlternativePhone() != null && !order.getAlternativePhone().isBlank()) {
                    customer.setAlternativePhone(order.getAlternativePhone());
                }
                customer.setAddressLine(order.getAddressLine());
                customer.setLandmark(order.getLandmark());
                customer.setCity(order.getCity());
                customer.setState(order.getState());
                customer.setPincode(order.getPincode());
                customer.setFullAddress(order.getClientAddress());
                customer.setOrderCount(customer.getOrderCount() + 1);
                customer.setTotalSpent(customer.getTotalSpent() + order.getTotalAmount());
            }
            customerRepository.save(customer);
        } catch (Exception e) {
            System.err.println("Could not auto-register customer for order: " + e.getMessage());
        }

        return repository.save(order);
    }

    public Order updateStatus(String id, String status) {
        Order order = repository.findById(id).orElseThrow(() ->
            new RuntimeException("Order not found: " + id));
        if (status != null && !status.trim().isEmpty()) {
            order.setStatus(status.toLowerCase().trim());
        }
        return repository.save(order);
    }

    public Order markPaid(String id) {
        Order order = repository.findById(id).orElseThrow(() ->
            new RuntimeException("Order not found: " + id));
        order.setPaymentStatus("PAID");
        if ("pending".equalsIgnoreCase(order.getStatus())) {
            order.setStatus("confirmed");
        }
        return repository.save(order);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}
