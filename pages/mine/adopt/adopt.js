const util = require('../../../utils/util.js')

const app = getApp()
var userId
var pageNum = 1
var pageSize = 10
var adoptStatus = '0,1,2,3'
var adoptlistArr = []
var bottomLast=false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    chosenId: 1,
    showLoading: true,
    photoPrefix: app.globalData.staticResourceUrlPrefix,
    bottomLast: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    userId = app.globalData.userId
    adoptlistArr = []
  },

  chooseTab: function(e) {
    var that = this
    var chosenId = e.currentTarget.dataset.id;
    if (chosenId == 1) {
      adoptStatus = '0,1,2,3'
    } else if (chosenId == 2) {
      adoptStatus = '4'
    } else {
      adoptStatus = '5'
    }
    pageNum=1
    adoptlistArr = []
    this.setData({
      showLoading: true,
      chosenId: chosenId,
      petInfoList: []
    })
    this.getPetAdoptList()

  },

  getPetAdoptList: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/pets/list',
      data: {
        adoptStatus: adoptStatus,
        createBy: userId,
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function(res) {
        var petInfoList = res.data.data.list
        var bottomLast = false
        if (res.data.data.total < pageSize) {
          bottomLast = true
        }
        for (var i = 0; i < petInfoList.length; i++) {
          petInfoList[i].petCharacteristic = JSON.parse(petInfoList[i].petCharacteristic)
        }
        adoptlistArr = adoptlistArr.concat(petInfoList)
        that.setData({
          petInfoList: adoptlistArr,
          showLoading: false,
          bottomLast: bottomLast
        })
      }
    })
  },
  modify:function(e){
    var petId = e.currentTarget.dataset.petid
    wx.navigateTo({
      url: '../../post/adopt/adopt?loadState=1&petId=' + petId,
    })
  },
  online: function(e) {
    wx.showLoading({
      title: '上线中',
    })
    var that = this
    var petId = e.currentTarget.dataset.petid
    var dataReq = {
      petId: petId,
      adoptStatus: '3',
      mediaList: []
    }
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/pets/info',
      data: dataReq,
      method: "PUT",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        pageNum = 0
        wx.showToast({
          title: '上线成功',
          icon: 'none',
          duration: 2000
        })
        adoptlistArr = []
        that.setData({
          petInfoList: []
        })
        that.getPetAdoptList()
      }
    })
  },
  offline: function(e) {
    wx.showLoading({
      title: '下线中',
    })
    var that = this
    var petId = e.currentTarget.dataset.petid
    var dataReq = {
      petId: petId,
      adoptStatus: '2',
      mediaList: []
    }
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/pets/info',
      data: dataReq,
      method: "PUT",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        pageNum = 0
        wx.hideLoading()
        wx.showToast({
          title: '下线成功',
          icon: 'none',
          duration: 2000
        })
        adoptlistArr = []
        that.setData({
          petInfoList: []
        })
        that.getPetAdoptList()
      }
    })
  },
  detail: function(e) {
    var petId = e.currentTarget.dataset.petid
    wx.navigateTo({
      url: '../../adoption/detail/detail?petId=' + petId,
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    adoptlistArr = []
    pageNum = 1
    this.setData({
      petInfoList: []
    })
    this.getPetAdoptList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this
    //刷新页面
    if (!bottomLast) {
      pageNum++;
      that.getPetAdoptList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    wx.hideShareMenu()
  }
})