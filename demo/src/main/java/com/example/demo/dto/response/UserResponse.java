package com.example.demo.dto.response;

public class UserResponse {

    private Long id;
    private String username;
    private String role;
    private boolean status;

    public UserResponse() {
    }

    public UserResponse(
            Long id,
            String username,
            String role,
            boolean status
    ) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public boolean isStatus() {
        return status;
    }


    public UserResponse updateStatus(Long id, boolean status) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateStatus'");
    }
}
