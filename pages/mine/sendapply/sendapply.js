const util = require('../../../utils/util.js')

const app = getApp()
var userId
var pageNum = 1
var pageSize = 10
var applyStatus = 0
var actionSheetList = ['双方达成一致取消申请', '领养人不想领养了', '宠物已被领养']
var applyArr = []
var bottomLast = false
var reqRefuseTimeout;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    chosenId: 1,
    photoPrefix: app.globalData.staticResourceUrlPrefix
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    userId = app.globalData.userId
    applyArr = []
    applyStatus = '0'
  },
  chooseTab: function(e) {
    var that = this
    var chosenId = e.currentTarget.dataset.id;
    if (chosenId == 1) {
      applyStatus = 0
    } else if (chosenId == 2) {
      applyStatus = '1,2,3'
    } else if (chosenId == 3) {
      applyStatus = 4
    } else if (chosenId == 4) {
      applyStatus = 5
    }
    applyArr = []
    this.setData({
      applyList: [],
      showLoading: true,
      chosenId: chosenId,
    })
    pageNum = 1
    bottomLast = false
    this.getPetAdoptApplyList()

  },
  getPetAdoptApplyList: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/apply/list',
      data: {
        applyStatus: applyStatus,
        applyBy: userId,
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function(res) {
        var applyList = res.data.data.rows
        var bottomLast = false
        if (res.data.data.total < pageSize) {
          bottomLast = true
        }
        applyArr = applyArr.concat(applyList)
        that.setData({
          applyList: applyArr,
          showLoading: false,
          bottomLast: bottomLast
        })
      }
    })
  },
  detail: function(e) {
    var applyId = e.currentTarget.dataset.applyid
    wx.navigateTo({
      url: '../receiveapplydetail/receiveapplydetail?applyId=' + applyId,
    })
  },
  toDetail: function(e) {
    this.genFormId(e.detail.formId)
    var applyId = e.detail.value.applyId
    wx.navigateTo({
      url: '../receiveapplydetail/receiveapplydetail?applyId=' + applyId,
    })
  },
  cancel: function(e) {
    var that = this
    wx.showActionSheet({
      itemList: actionSheetList,
      success(res) {
        that.refuse(e.detail.value.applyId, '领养人取消申请:' + actionSheetList[res.tapIndex], e.detail.formId)
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  refuse: function(applyId, applyResp, formId) {
    var that = this
    var applyId = applyId
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/apply/info',
      data: {
        applyId: applyId,
        applyStatus: '5',
        applyResp: applyResp,
        formId: formId,
        operateUserId: userId
      },
      method: "PUT",
      success: function(res) {
        if (res.data.success) {
          wx.showToast({
            title: '取消成功',
            duration: 2000,
            mask: true,
            icon: 'none'
          })
          reqRefuseTimeout = setTimeout(function() {
            pageNum = 1;
            bottomLast = false
            applyArr = []
            that.getPetAdoptApplyList()
          }, 2000)
        }
      }
    })
  },
  signContract: function(e) {
    var applyId = e.detail.value.applyId
    this.genFormId(e.detail.formId)
    wx.navigateTo({
      url: '../../post/contract/contract?applyId=' + applyId,
    })
  },
  contract: function(e) {
    var applyId = e.detail.value.applyId
    this.genFormId(e.detail.formId)
    wx.navigateTo({
      url: '../../mine/contract/contract?applyId=' + applyId,
    })
  },
  genFormId: function(formId) {
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/formId',
      data: {
        formId: formId,
        userId: userId
      },
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {}
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
    pageNum = 1
    bottomLast = false
    applyArr = []
    this.getPetAdoptApplyList()
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
    clearTimeout(reqRefuseTimeout)
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
      that.getPetAdoptApplyList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})