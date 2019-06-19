import WeCropper from '../../../utils/we-cropper/we-cropper.js'
const photoPrefix = 'https://melody.memorychilli.com/';
const util = require('../../../utils/util.js')
const app = getApp()
var ctx;
var postId = '';
const device = wx.getSystemInfoSync() // 获取设备信息
const width = device.windowWidth // 示例为一个与屏幕等宽的正方形裁剪框
const height = width

var petPortraitUpTemp; //宠物头像图片cos返回路径
var petPortraitUp; //宠物头像图片本地地址
var petPortraitMapUp; //宠物头像地图图片本地地址

var tempFilePaths; //选择图片临时地址

Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoPrefix: photoPrefix,
    visitNo: '??',
    nvabarData: {
      showCapsule: 0, //是否显示左上角图标
      showCapsuleSingle: 1, //是否显示左上角图标
      showIndex: false,
      title: '寻宠详情', //导航栏 中间的标题
      background: '#fff',
      color: '#2d2d2d',
      share: true
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,
    showcanvasCover: false,
    postId: '',
    cropperOpt: {
      id: 'cropper',
      width: 750, // 画布宽度
      height: 960, // 画布高度
      scale: 2.5, // 最大缩放倍数
      zoom: 8, // 缩放系数
      cut: {
        x: (width - 200) / 2, // 裁剪框x轴起点
        y: (width - 200) / 2, // 裁剪框y轴期起点
        width: 200, // 裁剪框宽度
        height: 200 // 裁剪框高度
      }
    },
    cutImage: 'hide',
    addtribeConShow: 'hide'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    wx.showLoading({
      title: '加载中',
    })
    console.log(options);
    console.log('参数：' + options.scene);
    if (options.scene != null && typeof(options.scene) != 'undefined' && options.scene != '') {
      postId = decodeURIComponent(options.scene)
    } else {
      postId = options.postId
    }

    var recordType = options.type
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/lost/posts/post',
      data: {
        postId: postId
      },
      method: "GET",
      dataType: "json",
      success: function(res) {
        console.log(res.data)
        var resData = res.data.data
        var images = JSON.parse(resData.images)
        resData.images = images
        var content = JSON.parse(resData.content)
        resData.content = content
        //对内容字段进行转义
        if (resData.content.emergencyType == '1') {
          var lostDays = util.formatDateDiff(resData.content.lostDate);
          resData.content["lostDay"] = lostDays;
        } else if (resData.content.emergencyType == '2') {
          var findDays = util.formatDateDiff(resData.content.findDate);
          resData.content["findDay"] = findDays;
        }

        that.setData({
          record: resData,
          postId: postId
        })
        wx.hideLoading();

      }
    })

  },
  authorizeFilter: function() {
    //only authorized user can get platform information
    if (!app.globalData.authorized) {
      //to authority page
      wx.navigateTo({
        url: '../../authority/authority?tag=0',
      })
    }
  },
  copyWxAccount: function(e) {
    var wxAccount = e.currentTarget.dataset.wxaccount;
    wx.setClipboardData({
      data: wxAccount,
      success(res) {
        wx.showToast({
          title: '复制成功',
          duration: 1500
        })
      }
    })
  },
  copyPhone: function(e) {
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  collectTap: function(e) {
    this.authorizeFilter();
    var that = this;
    var postId = e.currentTarget.dataset.postId;
    var collectOrNot = this.data.record.collectOrNot
    if (collectOrNot == 1) {
      that.data.record.collectOrNot = 0
      that.data.record.collectNumber--

    } else {
      that.data.record.collectOrNot = 1
      that.data.record.collectNumber++
    }

    wx.request({
      url: app.globalData.requestUrl + '/record/collect',
      data: {
        postId: postId,
        userId: app.globalData.userId
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      dataType: "json",
      success: function(res) {
        that.setData({
          record: that.data.record
        })
      }
    })


  },
  likeTap: function(e) {
    this.authorizeFilter();
    wx.showLoading({
      title: '加载中',
    })
    var likeJudge = false;
    var that = this;
    var postId = e.currentTarget.dataset.postId;
    var recordType = e.currentTarget.dataset.recordtype;
    var likeOrNot = this.data.record.likeOrNot
    if (likeOrNot == 1) {
      that.data.record.likeOrNot = 0
      that.data.record.likeNumber--
    } else {
      wx.show
      that.data.record.likeOrNot = 1
      that.data.record.likeNumber++
        likeJudge = true
    }

    wx.request({
      url: app.globalData.requestUrl + '/record/like',
      data: {
        postId: postId,
        userId: app.globalData.userId,
        recordType: recordType
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      dataType: "json",
      success: function(res) {
        wx.hideLoading();
        if (likeJudge) {
          wx.showToast({
            title: '爱你哦~么么哒~~',
            icon: 'none',
            duration: 1000
          })
        }
        that.setData({
          record: that.data.record
        })
      }
    })

  },
  addFollowUser: function(e) {
    this.authorizeFilter();
    var that = this
    var userId = e.currentTarget.dataset.userid;
    wx.request({
      url: app.globalData.requestUrl + '/userFollow/user/' + userId,
      data: {
        followUserId: app.globalData.userId
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      dataType: "json",
      success: function(res) {
        var userFollowOrNot = that.record.userFollowOrNot
        if (userFollowOrNot == 0) {
          that.record.userFollowOrNot = 1
        } else {
          that.record.userFollowOrNot = 0
        }

        that.setData({
          record: record
        })
      }
    })
  },

  processFollowPet: function(e) {
    this.authorizeFilter();
    var that = this
    var petId = e.currentTarget.dataset.petid;
    wx.request({
      url: app.globalData.requestUrl + '/userFollow/pet/' + petId,
      data: {
        userId: app.globalData.userId
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      dataType: "json",
      success: function(res) {
        var petFollowOrNot = that.data.record.petFollowOrNot
        if (petFollowOrNot == 0) {
          that.data.record.petFollowOrNot = 1
        } else {
          that.data.record.petFollowOrNot = 0
        }

        that.setData({
          record: that.data.record
        })
      }

    })
  },

  previewImg: function(e) {
    var imgurls = e.currentTarget.dataset.imgurls;
    for (var i = 0; i < imgurls.length; i++) {
      imgurls[i] = photoPrefix + imgurls[i]
    }
    var imgindex = e.currentTarget.dataset.imgindex;

    wx.previewImage({
      urls: imgurls,
      current: imgurls[imgindex],
      success: function() {

      },
      fail: function(e) {
        console.log(e)
      }
    })
  },


  toExplore: function() {
    wx.switchTab({
      url: '../explore/explore',
    })
  },

  genHelpCard: function() {
    var that = this
    this.setData({
      showcanvasCover: true,
      firstStep: 'show',
      cutImage: 'hide',
      addtribeConShow: 'hide',
      nvabarData: {
        showCapsule: 1,
        title: '宠物救助卡',
      },
    })
    this.initEvn();
  },
  initEvn: function() {

    wx.hideShareMenu();
    const {
      cropperOpt
    } = this.data
    new WeCropper(cropperOpt)
      .on('ready', (ctx) => {
        console.log(`wecropper is ready for work!`)
      })
      .on('beforeImageLoad', (ctx) => {
        console.log(`before picture loaded, i can do something`)
        console.log(`current canvas context: ${ctx}`)
        wx.showToast({
          title: '上传中',
          icon: 'loading',
          duration: 20000,
          mask: true
        })
      })
      .on('imageLoad', (ctx) => {
        console.log(`picture loaded`)
        console.log(`current canvas context: ${ctx}`)
        wx.hideToast()
      })
  },

  touchStart(e) {
    this.wecropper.touchStart(e)
  },
  touchMove(e) {
    this.wecropper.touchMove(e)
  },
  touchEnd(e) {
    this.wecropper.touchEnd(e)
  },
  chooseImage: function() {
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        tempFilePaths = res.tempFilePaths
        that.setData({
          cutImage: 'show',
          addtribeConShow: 'hide',
          firstStep: 'hide',
          showCover: false
        })
        const src = tempFilePaths[0]
        that.wecropper.pushOrign(src)
      }
    })
  },

  getCropperImage: function() {
    wx.showLoading({
      title: '正在处理',
      mask: true
    })
    var that = this;
    that.wecropper.getCropperImage((src) => {

      if (src) {
        console.log("输出canvas图片路径" + src);
        petPortraitUp = src
        that.setData({
          cutImage: 'hide',
          addtribeConShow: 'show',
          firstStep: 'hide',
          showCover: true,
          templateImg: src
        })

        //缓存图片
        that.refreshCanvas();
      }
    })
  },

  hideCanvasCover: function() {
    this.setData({
      showcanvasCover: false,
      nvabarData: {
        showCapsule: 1,
        title: '邻宠.发现',
      },
    })
  },


  turnToImage: function() {

    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 600,
      height: 990,
      destWidth: 600,
      destHeight: 990,
      canvasId: 'myCanvas',
      success: function(res) {
        console.log(res.tempFilePath)
        var sendImage = res.tempFilePath;
        wx.previewImage({
          current: res.tempFilePath, // 当前显示图片的http链接
          urls: [res.tempFilePath] // 需要预览的图片http链接列表
        })
      }
    })
  },
  refreshCanvas: function(url) {
    var that = this

    wx.request({
      url: app.globalData.requestUrl + '/wxAuth/generateWxACode',
      dataType: "json",
      method: "GET",
      data: {
        scene: postId
      },
      success: function(res) {
        var wxAcodeUrl = photoPrefix + res.data.data.wxImageUrl;
        wx.getImageInfo({
          src: wxAcodeUrl,
          success(res) {
            wxAcodeUrl = res.path;
            var record = that.data.record;
            var emergencyType = record.content.emergencyType;
            var lostday = 0
            var title = ''

            var reward = record.content.reward
            var detailInfo = record.content.detailInfo
            var specialPoint = record.content.specialPoint


            // var lostDay = record.content.lostDay
            var petPic = petPortraitUp
            var location = record.location
            ctx = wx.createCanvasContext('myCanvas');
            ctx.drawImage('../images/logo/background-post (2).png', 0, 0, 300, 500)
            // ctx.setFillStyle('white')
            // ctx.fillRect(0, 0, 300, 500)
            ctx.setFontSize(18)
            ctx.setFillStyle('#fff')
            ctx.fillText('我要回家', 110, 30)
            ctx.drawImage(petPic, 50, 45, 200, 200)
            ctx.setFontSize(14)
            var text = [detailInfo, '特征：' + specialPoint, '丢失地点：' + location]
            var loop = 0
            var basicLevel = 245;
            while (loop < 3) {
              basicLevel = basicLevel + 10;
              var chr = text[loop].split(""); //这个方法是将一个字符串分割成字符串数组

              var temp = "";
              var row = [];
              ctx.setFontSize(12)
              ctx.setFillStyle("#fff")
              for (var a = 0; a < chr.length; a++) {
                if (ctx.measureText(temp).width < 260) {
                  temp += chr[a];
                } else {
                  a--; //这里添加了a-- 是为了防止字符丢失，效果图中有对比
                  row.push(temp);
                  temp = "";
                }
              }
              row.push(temp);

              //如果数组长度大于2 则截取前两个
              if (row.length > 3) {
                var rowCut = row.slice(0, 3);
                var rowPart = rowCut[2];
                var test = "";
                var empty = [];
                for (var a = 0; a < rowPart.length; a++) {
                  if (ctx.measureText(test).width < 240) {
                    test += rowPart[a];
                  } else {
                    break;
                  }
                }
                empty.push(test);
                var group = empty[0] + "..." //这里只显示两行，超出的用...表示
                rowCut.splice(2, 2, group);
                row = rowCut;
              }
              for (var b = 0; b < row.length; b++) {
                basicLevel = basicLevel + 15
                console.log('basicLevel:' + basicLevel);
                ctx.fillText(row[b], 20, basicLevel, 300);
              }
              loop++;
            }


            if (reward != '' && typeof(reward) != 'undefined' && reward != null) {
              ctx.setFontSize(20)
              ctx.setFillStyle('#fff')
              ctx.fillText('酬金:' + reward + '元', 30, 445)
              ctx.setFontSize(10)
              ctx.setFillStyle('#fff')
              ctx.fillText('长按识别二维码，查看救助详情', 30, 470)
            } else {
              ctx.setFontSize(10)
              ctx.setFillStyle('#fff')
              ctx.fillText('长按识别二维码，查看救助详情', 30, 450)
            }

            ctx.drawImage(wxAcodeUrl, 190, 405, 60, 60)

            ctx.draw();
            wx.hideLoading()
          }
        })
      }
    })
  },

  exportCanvas: function() {
    wx.showLoading({
      title: '保存中',
    })
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 600,
      height: 990,
      destWidth: 600,
      destHeight: 990,
      canvasId: 'myCanvas',
      success: function(res) {
        console.log(res.tempFilePath)
        var sendImage = res.tempFilePath;
        wx.saveImageToPhotosAlbum({
          filePath: sendImage,
          success(res) {
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
              duration: 1500
            })
          }
        })
      }
    })
  },

  saveToAlbum: function() {
    var that = this
    wx.getSetting({
      success(res) {
        console.log(res.authSetting)
        if (res.authSetting['scope.writePhotosAlbum']) {
          that.exportCanvas()
        } else {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              that.exportCanvas()
            },
            fail() {
              wx.showToast({
                title: '由于您未授权小程序操作相册，可手动点击图片长按进行保存',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
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
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    this.authorizeFilter();
    var record = this.data.record;
    var sharepostId = record.postId;
    var type = record.type;
    var target;
    var imageUrl;
    if (type == '0') {
      target = record.petName + '的新动态'
    } else if (type != '0' && type != '3') {
      target = record.nickName + '的新动态'
    } else if (type == '3') {
      var content = record.content;
      var emergencyType = content.emergencyType;
      var location = record.location;
      if (emergencyType == '1') {
        var lostDays = util.formatDateDiff(content.lostDate);
        var reward = content.reward;
        if (lostDays == 0) {
          if (reward != 0 && reward != undefined) {
            target = '我家' + content.petName + '今天走丢,酬金' + reward + ',请帮它回家';
          } else {
            target = '我家' + content.petName + '今天走丢,请帮它回家';
          }

        } else {
          if (reward != 0 && reward != undefined) {
            target = '我叫' + content.petName + '走丢了' + lostDays + '天,酬金' + reward + '请帮我回家';
          } else {
            target = '我叫' + content.petName + '走丢了' + lostDays + '天,请帮我回家';
          }
        }

      } else {
        var findDays = util.formatDateDiff(content.findDate);

        if (findDays == 0) {
          target = '我刚刚迷路了,请帮我找家,我在' + location + '附近';
        } else {
          target = '我离开主人' + findDays + '天了,请帮我找家,我在' + location + '附近';
        }

      }
    }

    imageUrl = photoPrefix + record.images[0];

    return {
      title: target,
      path: '/pages/exploredetail/exploredetail?postId=' + sharepostId + '&type=' + type,
      imageUrl: imageUrl,
      success: function(res) {
        record.shareNumber++
          that.setData({
            record: record
          })

        //保存转发记录
        wx.request({
          url: app.globalData.requestUrl + '/record/share',
          data: {
            postId: sharepostId,
            userId: app.globalData.userId,
            recordType: type
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded' // 默认值
          },
          dataType: "json",
          success: function(res) {
            wx.showToast({
              title: '转发成功',
              icon: 'none',
              duration: 1000
            })
          }
        })
      }
    }
  },
})