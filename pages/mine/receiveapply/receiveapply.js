const util = require('../../../utils/util.js')

const app = getApp()
var userId
var pageNum = 1
var pageSize = 10
var applyStatus = 0
var actionSheetList = ['双方达成一致取消申请', '领养人资质不符合要求', '送养人不想送养了', '宠物已被领养']
var applyArr=[]
var bottomLast =false
var reqPassTimeout;
var reqRefuseTimeout;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav:app.globalData.marginNav,
    chosenId: 1,
    photoPrefix: app.globalData.staticResourceUrlPrefix
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    applyArr=[]
    applyStatus = '0'
    userId = app.globalData.userId
  },

  chooseTab: function(e) {
    var that = this
    var chosenId = e.currentTarget.dataset.id;
    if (chosenId == 1) {
      applyStatus = '0'
    } else if (chosenId == 2) {
      applyStatus = '1,2,3'
    } else if (chosenId == 3) {
      applyStatus = '4'
    } else if (chosenId == 4) {
      applyStatus = '5'
    }
    applyArr=[]
    pageNum=1
    bottomLast=false
    this.setData({
      applyList:[],
      showLoading: true,
      chosenId: chosenId,
    })
    this.getPetAdoptApplyList()

  },


  getPetAdoptApplyList: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/apply/list',
      data: {
        applyStatus: applyStatus,
        adopterId: userId,
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
  refusePop: function(e) {
    var that = this
    wx.showActionSheet({
      itemList: actionSheetList,
      success(res) {
        that.refuse(e.detail.value.applyId, actionSheetList[res.tapIndex], e.detail.formId)
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  refuse: function (applyId, applyResp, formId) {
    wx.showLoading({
      title: '操作中',
    })
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
        wx.hideLoading()
        if (res.data.success) {
          wx.showToast({
            title: '取消成功',
            duration: 2000,
            mask: true,
            icon: 'none'
          })
          reqRefuseTimeout=setTimeout(function() {
            applyArr = []
            pageNum = 1
            bottomLast = false
            that.getPetAdoptApplyList()
          }, 2000)
        }
      }
    })
  },
  pass: function(e) {
    wx.showLoading({
      title: '操作中',
    })
    var that = this
    var applyId = e.detail.value.applyId
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/apply/info',
      data: {
        applyId: applyId,
        applyStatus: '1',
        formId: e.detail.formId,
        operateUserId:userId
      },
      method: "PUT",
      success: function(res) {
        wx.hideLoading()
        if (res.data.success) {
          wx.showToast({
            title: '初审成功',
            duration: 2000,
            mask: true,
            icon: 'none'
          })
          reqPassTimeout=setTimeout(function() {
            pageNum=1
            applyArr=[]
            bottomLast=false
            that.getPetAdoptApplyList()
          }, 2000)
        }
      }
    })
  },
  detail: function(e) {
    var applyId =e.currentTarget.dataset.applyid
    wx.navigateTo({
      url: '../receiveapplydetail/receiveapplydetail?applyId=' + applyId,
    })
  },
  contract:function(e){
    this.genFormId(e.detail.formId)
    var applyId = e.detail.value.applyId
    wx.navigateTo({
      url: '../../post/contract/contract?applyId=' + applyId,
    })
  },
  contractDetail:function(e){
    this.genFormId(e.detail.formId)
    var applyId = e.detail.value.applyId
    wx.navigateTo({
      url: '../../mine/contract/contract?applyId=' + applyId,
    })
  },
  signContract: function (e) {
    this.genFormId(e.detail.formId)
    var applyId = e.detail.value.applyId
    wx.navigateTo({
      url: '../../post/contract/contract?applyId=' + applyId,
    })
  },
  genFormId: function (formId) {
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
      success: function (res) { }
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
    pageNum=1
    applyArr=[]
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
    clearTimeout(reqPassTimeout)
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