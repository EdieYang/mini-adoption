const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    homeIcon: false,
    backIcon: '../../images/back-pre-black.png',
    content: '',
    uploaderList: [],
    uploaderUrlArray: [],
    showUpload: true,
    uploaderNum: 0,
    groupId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.groupId = options.groupId
  },

  showImg: function (e) {
    var that = this;
    wx.previewImage({
      urls: that.data.uploaderList,
      current: that.data.uploaderList[e.currentTarget.dataset.index]
    })
  },

  //上传图片
  upload: function (e) {
    var that = this;
    wx.chooseImage({
      count: 9 - that.data.uploaderNum,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        console.log(res)
        let tempFilePaths = res.tempFilePaths;
        for (var i = 0; i < tempFilePaths.length; i++) {
          that.uploadImage(tempFilePaths[i])
        };
        let uploaderList = that.data.uploaderList.concat(tempFilePaths);
        if (uploaderList.length == 9) {
          that.setData({
            showUpload: false
          })
        }
        that.setData({
          uploaderList: uploaderList,
          uploaderNum: uploaderList.length,
        })
      }
    })
  },

  uploadImage(tempFilePath) {
    var that = this
    wx.uploadFile({
      url: app.globalData.uploadImageUrl,
      filePath: tempFilePath,
      name: 'file',
      formData: {
        userId: app.globalData.userId,
        ossZone: 'groupPost'
      },
      success: (resp) => {
        var returnUrl = JSON.parse(resp.data);
        that.data.uploaderUrlArray.push(returnUrl.data)
      }
    });
  },

  inputContent(e) {
    this.data.content = e.detail.value
  },
  delImg(e){
    var index=e.currentTarget.dataset.index
    this.data.uploaderUrlArray.splice(index, 1)
    this.data.uploaderList.splice(index, 1)
    this.setData({
      uploaderList: this.data.uploaderList,
      uploaderUrlArray: this.data.uploaderUrlArray
    })
  },

  post() {
    if (!this.data.content && this.data.uploaderUrlArray.length === 0) {
      wx.showToast({
        title: '请完善帖子',
        icon: 'none'
      })
      return
    }
    let cmsGroupPostImgList = []
    this.data.uploaderUrlArray.map((item, index) => {
      cmsGroupPostImgList.push({
        imgUrl: item,
        sort: index
      })
    })
    let cmsGroupPost = {
      groupId: this.data.groupId,
      postContent: this.data.content,
      userId: app.globalData.userId
    }
    wx.request({
      url: app.globalData.requestUrlCms + '/group/post',
      data: {
        cmsGroupPost: cmsGroupPost,
        cmsGroupPostImgList: cmsGroupPostImgList
      },
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.success) {
          var prePage = getCurrentPages()[getCurrentPages().length - 2]
          prePage.setData({
            isGetPoint: true
          })
          wx.navigateBack({
            delta: 1
          })
        }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})