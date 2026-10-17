package com.kpclothing.backend.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class OrderItem implements Serializable {

    private String productId;
    private String code;
    private String name;
    private double price;
    private int quantity;
    private String size;
    private String image;

    public OrderItem() {}

    public OrderItem(String productId, String code, String name, double price, int quantity, String size, String image) {
        this.productId = productId;
        this.code = code;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.size = size != null ? size : "Free Size";
        this.image = image;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
