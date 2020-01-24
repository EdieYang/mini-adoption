const app = getApp()
var userId=''
var pageSize = 10
var pageNum = 1
let bottomLast = false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    homeIcon: false,
    backIcon: '../../images/back-pre-black.png',
    showExpand: false,
    posts: [],
    prefix: app.globalData.staticResourceUrlPrefix
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userId = app.globalData.userId
    pageNum=1
    this.getPosts()
  },
  getPosts: function () {
    var that = this
    let queryData = {
      isValid: 1,
      userId: userId,
      pageNum: pageNum,
      pageSize: pageSize
    }
    wx.request({
      url: app.globalData.requestUrlCms + '/group/post/user/page',
      data: queryData,
      method: "GET",
      success: function (res) {
        console.log(res)
        var posts = res.data.data.list
        if (res.data.data.list.length < pageSize) {
          bottomLast = true
        }
        posts.map(item => {
          item.showAll = item.postContent.length < 48
        })
        that.setData({
          posts: posts,
          bottomLast: bottomLast
        })
      }
    })
  },
  previewImg: function (e) {
    var that = this
    var imgList = e.currentTarget.dataset.img
    var imgUrls = []
    imgList.map(item => {
      imgUrls.push(that.data.prefix + item.imgUrl)
    })
    wx.previewImage({
      urls: imgUrls,
    })
  },
  showAll(e) {
    this.data.posts[e.currentTarget.dataset.index].showAll = true
    this.setData({
      posts: this.data.posts
    })
  },

  showSheet(e) {
    let that = this
    wx.showActionSheet({
      itemList: ['删除'],
      success(res) {
        that.deletePost(e.currentTarget.dataset.index)
      }
    })
  },

  deletePost(index) {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/group/post',
      data: {
        postId: that.data.posts[index].postId,
        memo: '用户删帖',
      },
      method: "DELETE",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        that.data.posts.splice(index, 1)
        that.setData({
          posts: that.data.posts
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    //刷新页面
    if (!bottomLast) {
      pageNum++;
      wx.showLoading({
        title: '抓会儿蜜蜂~',
      })
      that.getPosts()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})