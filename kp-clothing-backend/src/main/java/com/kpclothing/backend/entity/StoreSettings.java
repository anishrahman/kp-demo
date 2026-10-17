package com.kpclothing.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "store_settings")
public class StoreSettings {

    @Id
    private Long id = 1L; // singleton row - only ever one settings record

    @Column(length = 1000)
    private String address;
    private String phone;
    @Column(length = 2000)
    private String mapLocation;
    private String instagramId;
    private String storyTitle;
    @Column(length = 4000)
    private String storyContent;
    @Column(length = 1000)
    private String storyImage;
    @Column(length = 1000)
    private String logoUrl;
    @Column(length = 1000)
    private String heroVideoUrl;
    @Column(length = 1000)
    private String bottomVideoUrl;

    private String brandName;
    private String brandTagline;
    private String whatsappPhone = "917397335037";
    private String aboutHeading;
    @Column(length = 4000)
    private String aboutText;
    @Column(length = 1000)
    private String bannerText;

    private String upiId = "kpclothing@upi";
    private String upiPayeeName = "KP Clothing";
    @Column(length = 1000)
    private String upiQrImageUrl;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getMapLocation() { return mapLocation; }
    public void setMapLocation(String mapLocation) { this.mapLocation = mapLocation; }

    public String getInstagramId() { return instagramId; }
    public void setInstagramId(String instagramId) { this.instagramId = instagramId; }

    public String getStoryTitle() { return storyTitle; }
    public void setStoryTitle(String storyTitle) { this.storyTitle = storyTitle; }

    public String getStoryContent() { return storyContent; }
    public void setStoryContent(String storyContent) { this.storyContent = storyContent; }

    public String getStoryImage() { return storyImage; }
    public void setStoryImage(String storyImage) { this.storyImage = storyImage; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getHeroVideoUrl() { return heroVideoUrl; }
    public void setHeroVideoUrl(String heroVideoUrl) { this.heroVideoUrl = heroVideoUrl; }

    public String getBottomVideoUrl() { return bottomVideoUrl; }
    public void setBottomVideoUrl(String bottomVideoUrl) { this.bottomVideoUrl = bottomVideoUrl; }

    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
    public String getBrandTagline() { return brandTagline; }
    public void setBrandTagline(String brandTagline) { this.brandTagline = brandTagline; }
    public String getWhatsappPhone() { return whatsappPhone; }
    public void setWhatsappPhone(String whatsappPhone) { this.whatsappPhone = whatsappPhone; }
    public String getAboutHeading() { return aboutHeading; }
    public void setAboutHeading(String aboutHeading) { this.aboutHeading = aboutHeading; }
    public String getAboutText() { return aboutText; }
    public void setAboutText(String aboutText) { this.aboutText = aboutText; }
    public String getBannerText() { return bannerText; }
    public void setBannerText(String bannerText) { this.bannerText = bannerText; }

    public String getUpiId() { return upiId != null ? upiId : "kpclothing@upi"; }
    public void setUpiId(String upiId) { this.upiId = upiId; }

    public String getUpiPayeeName() { return upiPayeeName != null ? upiPayeeName : "KP Clothing"; }
    public void setUpiPayeeName(String upiPayeeName) { this.upiPayeeName = upiPayeeName; }

    public String getUpiQrImageUrl() { return upiQrImageUrl; }
    public void setUpiQrImageUrl(String upiQrImageUrl) { this.upiQrImageUrl = upiQrImageUrl; }
}
