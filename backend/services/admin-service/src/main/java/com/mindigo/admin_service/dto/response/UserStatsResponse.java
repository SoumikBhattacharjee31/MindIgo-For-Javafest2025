package com.mindigo.admin_service.dto.response;

public class UserStatsResponse {
    private long totalUsers;
    private long totalCounselors;
    private long totalActiveUsers;

    public UserStatsResponse() {}
    // Getters and Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalCounselors() { return totalCounselors; }
    public void setTotalCounselors(long totalCounselors) { this.totalCounselors = totalCounselors; }
    public long getTotalActiveUsers() { return totalActiveUsers; }
    public void setTotalActiveUsers(long totalActiveUsers) { this.totalActiveUsers = totalActiveUsers; }
}