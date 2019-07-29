package ru.relex.restaurant.service.DTO;


import java.util.Date;

public class HistoryDto {
  private int id;
  private Date time;
  private OrdersForHistoryDto order;


  private int statusId;
  private int user_id;
  private Integer cook_id;

  public HistoryDto() {


  }

  public HistoryDto(int id, Date time, OrdersForHistoryDto order, int statusId, int user_id, Integer cook_id) {
    this.id = id;
    this.time = time;
    this.order = order;
    this.statusId = statusId;
    this.user_id = user_id;
    this.cook_id = cook_id;

  }

  public int getId() {
    return id;
  }

  public void setId(int id) {
    this.id = id;
  }

  public Date getTime() {
    return time;
  }

  public void setTime(Date time) {
    this.time = time;
  }


  public OrdersForHistoryDto getOrder() {
    return order;
  }

  public void setOrder(OrdersForHistoryDto order) {
    this.order = order;
  }

  public int getUser_id() {
    return user_id;
  }

  public void setUser_id(int user_id) {
    this.user_id = user_id;
  }

  public Integer getCook_id() {
    return cook_id;
  }

  public void setCook_id(Integer cook_id) {
    this.cook_id = cook_id;
  }

  public int getStatusId() {
    return statusId;
  }

  public void setStatusId(int statusId) {
    this.statusId = statusId;
  }
}

