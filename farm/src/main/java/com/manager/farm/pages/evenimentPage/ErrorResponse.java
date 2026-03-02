package com.manager.farm.pages.evenimentPage;



public class ErrorResponse {
    private String message;
    private int status;
    private long timestamp;

    public ErrorResponse(String message, int status) {
        this.message = message;
        this.status = status;
        this.timestamp = System.currentTimeMillis();
    }

    public String getMessage() { return message; }
    public int getStatus() { return status; }
    public long getTimestamp() { return timestamp; }

    public void setMessage(String message) { this.message = message; }
    public void setStatus(int status) { this.status = status; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}