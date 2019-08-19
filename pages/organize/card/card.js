const util = require('../../../utils/util.js')

const app = getApp()
var userId
var orgId
var context
var destHeight
var destWidth


Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    photoPrefix: app.globalData.staticResourceUrlPrefix,
    destWidth:0,
    destHeight:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    orgId = options.orgId
    userId = app.globalData.userId
    wx.showLoading({
      title: '生成名片中',
    })
    this.getOrgDetail()
  },
  getOrgDetail: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/orgs/info',
      data: {
        orgId: orgId
      },
      method: "GET",
      success: function(res) {
        that.setData({
          orgDetail: res.data.data
        })
      }
    })
  },
  generatePost: function() {
    var that = this
    var orgInfo = this.data.orgDetail
    context = wx.createCanvasContext("post-adoption", this)
    wx.getImageInfo({
      src: orgInfo.postImg,
      success(res) {
        var postImg = res.path
        context.drawImage(postImg, 0, 0, destWidth, destHeight)
        context.setFontSize(20)

        wx.request({
          url: app.globalData.requestUrlWechat + '/miniSystemApi/generateWxACode',
          dataType: "json",
          method: "GET",
          data: {
            path: 'pages/organize/home/home',
            scene: orgId
          },
          success: function(res) {
            var wxAcodeUrl = that.data.photoPrefix + res.data.data;
            wx.getImageInfo({
              src: wxAcodeUrl,
              success(res) {
                wxAcodeUrl = res.path;
                context.drawImage(wxAcodeUrl, 10, destHeight - 110, 90, 90)
                context.draw()
                wx.hideLoading()
              }
            })
          }
        })
      }
    })
  },
  onImageLoad: function(e) {
    var that = this
    let oImgW = e.detail.width; //图片原始宽度
    let oImgH = e.detail.height; //图片原始高

    wx.getSystemInfo({
      success(res) {
        destWidth = res.screenWidth
        destHeight = destWidth / oImgW * oImgH
        that.setData({
          destWidth:destWidth,
          destHeight:destHeight,
          oImgW: oImgW,
          oImgH: oImgH
        })
        that.generatePost()
      }
    })
  },
  drawText: function(ctx, str, leftWidth, initHeight, canvasWidth) {
    var lineWidth = 0;
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引
    for (let i = 0; i < str.length; i++) {
      lineWidth += ctx.measureText(str[i]).width;
      if (lineWidth > canvasWidth) {
        ctx.fillText(str.substring(lastSubStrIndex, i), leftWidth, initHeight); //绘制截取部分
        initHeight += 24; //16为字体的高度
        lineWidth = 0;
        lastSubStrIndex = i;
      }
      if (i >= 50) {
        ctx.fillText('...', leftWidth, initHeight);
        break
      }
      if (i == str.length - 1) { //绘制剩余部分
        ctx.fillText(str.substring(lastSubStrIndex, i + 1), leftWidth, initHeight);
      }

    }

    return initHeight
  },

  download: function() {
    var that = this
    var width = wx.getSystemInfoSync().windowWidth
    var contextHidden = wx.createCanvasContext('post-adoption-hidden', this)
    contextHidden.draw(false, wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: destWidth,
      height: destHeight,
      destWidth: that.data.oImgW,
      destHeight: that.data.oImgH,
      canvasId: 'post-adoption',
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
            });
          },
          fail() {
            wx.hideLoading()
          }
        })
      }
    }))
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
})