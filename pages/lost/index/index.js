const photoPrefix = 'https://melody.memorychilli.com/';
const util = require('../../../utils/util.js')
const app = getApp()
var userId;
var pageNo = 1;
var pageSize = 5;
var addCoverArrayPosts = [];
var imagesScrollArray = []
var contentArray = []
var bottomLast = false;
var chooseDuration = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showShoppingTip: false,
    showUpdateAnimation: '',
    photoPrefix: photoPrefix,
    userId: '',
    userInfo: {},
    bottomLast: false,
    nowCity: '上海市',
    nvabarData: {
      showCapsule: 0, //是否显示左上角图标
      showIndex: true,
      title: '寻宠', //导航栏 中间的标题
      background: '#fff',
      share: true
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    app.IfAccess().then(function(res) {
      if (res) {
        userId = app.globalData.userId;
        if (userId && typeof(userId) != 'undefined' && userId != '') {
          that.setData({
            userId: userId
          })
        }
      }
    })
    this.getLostPosts()
  },
  getLostPosts: function() {

    var that = this
    //初始化
    addCoverArrayPosts = []
    imagesScrollArray = []
    contentArray = []
    pageNo = 1

    wx.request({
      url: app.globalData.requestUrlCms + '/lost/posts',
      data: {
        pageNo: pageNo,
        pageSize: pageSize,
        city: this.data.nowCity,
      },
      method: "GET",
      dataType: "json",
      success: function(res) {
        console.log(res.data)
        var resData = res.data.data
        if (resData.length < 5) {
          bottomLast = true;
        }
        addCoverArrayPosts = addCoverArrayPosts.concat(resData);
        // 组装图片
        for (var i = 0; i < resData.length; i++) {
          //解析content内容
          var content = JSON.parse(resData[i].content);
          resData[i].content = content;
          //对内容字段进行转义
          var location = resData[i].content.location
          if (!location && typeof(location) != "undefined" && location != "") {
            if (location.length > 0) {
              location = location.substring(0, 20) + '...';
            }
            resData[i].content.location = location
          }
          var detailLocation = resData[i].content.detailLocation
          if (!detailLocation && typeof(detailLocation) != "undefined" && detailLocation != "") {
            if (detailLocation.length > 10) {
              detailLocation = detailLocation.substring(0, 10) + '...';
            }
            resData[i].content.detailLocation = detailLocation
          }
          if (resData[i].content.emergencyType == '1') {
            var lostDays = util.formatDateDiff(resData[i].content.lostDate);
            resData[i].content["lostDay"] = lostDays;
          } else if (resData[i].content.emergencyType == '2') {
            var findDays = util.formatDateDiff(resData[i].content.findDate);
            resData[i].content["findDay"] = findDays;
          }
          var record = {
            recordId: resData[i].postId,
            current: 1,
            imgLength: 0
          }
          if (resData[i].images != null || resData[i].images != '') {
            resData[i].images = JSON.parse(resData[i].images);
            record.imgLength = resData[i].images.length;
          }
          imagesScrollArray.push(record)

          contentArray.push(false);
        }
        chooseDuration = false

        that.setData({
          recordCharitylist: addCoverArrayPosts,
          imagesScrollArray: imagesScrollArray,
          contentArray: contentArray,
          bottomLast: bottomLast,
          showCharity: false
        })
        wx.hideLoading();
      }
    })
  },

  goActivity: function() {
    wx.navigateTo({
      url: '../activity/activitymagicwindow/activitymagicwindow?userId=' + userId,
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
    if (app.globalData.authorized) {
      userId = app.globalData.userId;
    }
  },

  processCharityList: function() {
    var that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          bottomLast = false;
          recommendlife = false;
          that.setData({
            userLocationShowFlag: true,
            defaultShowFlag: true,
            recordCharitylist: [],
            recordRecommendlist: [],
            bottomLast: bottomLast,
            openSwitch: true,
            showCharity: false,
            showRecommend: true,
            authorizeLocation: false
          })
          wx.hideLoading();
        } else {
          wx.getLocation({
            type: 'gcj02',
            success: function(res) {
              console.log('获取地理位置信息', res)
              var lat = res.latitude
              var lng = res.longitude
              //逆地址解析获取城市
              qqmapsdk.reverseGeocoder({
                location: {
                  latitude: lat,
                  longitude: lng
                },
                success: function(res) {
                  console.log(res);
                  var city = res.result.ad_info.city
                  bottomLast = false;
                  recommendlife = false;
                  that.setData({
                    nowCity: city,
                    userLocationShowFlag: false,
                    defaultShowFlag: true,
                    chosenId: that.data.chosenId,
                    showRecommend: true,
                    showCharity: true,
                    recordCharitylist: [],
                    recordRecommendlist: [],
                    bottomLast: bottomLast,
                    authorizeLocation: false
                  })

                  if (city != '未知') {
                    wx.hideLoading();
                    that.getCharityList();
                  }

                },
                fail: function(res) {
                  console.log(res);
                }
              });
            }
          })
        }
      },
      fail: function(res) {
        //调用getSetting失败（网络原因）
        wx.showLoading({
          title: '网络连接失败，请检查网络'
        })
        bottomLast = false;
        recommendlife = false;
        that.setData({
          nowCity: '网络连接失败，无法定位城市',
          userLocationShowFlag: false,
          defaultShowFlag: true,
          chosenId: that.data.chosenId,
          showRecommend: true,
          showCharity: true,
          recordCharitylist: [],
          recordRecommendlist: [],
          bottomLast: bottomLast,
          authorizeLocation: false
        })
      }
    })

  },

  bindchange: function(e) {
    var current = e.detail.current + 1
    var index = e.currentTarget.dataset.index
    imagesScrollArray[index].current = current;
    this.setData({
      imagesScrollArray: imagesScrollArray
    })
  },
  bindchangeforCharity: function(e) {
    var current = e.detail.current + 1
    var index = e.currentTarget.dataset.index
    imagesScrollArray[index].current = current;
    this.setData({
      imagesScrollArray: imagesScrollArray
    })
  },
  detail: function(e) {
    var postId = e.currentTarget.dataset.recordid;
    wx.navigateTo({
      url: '../detail/detail?postId=' + postId,
    })
  },
  extendContentPage: function(e) {
    var recordId = e.currentTarget.dataset.postId;
    wx.navigateTo({
      url: '../detail/detail?postId=' + recordId,
    })
  },
  toDiaryPage: function() {
    var authorized = this.authorizeFilter();
    if (!authorized) {
      return;
    }
    this.hideLayout();
    //判断有无缓存
    var storage = wx.getStorageSync("recordShortStorage");
    if (storage != undefined && storage != null && storage != "") {
      wx.showModal({
        title: '提示',
        content: '上次有未完成的编辑，是否继续',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../record/recordshort/recordshort?loadState=1',
            })
          }

          if (res.cancel) {
            wx.setStorageSync("recordShortStorage", "");
            wx.navigateTo({
              url: '../record/recordshort/recordshort',
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '../record/recordshort/recordshort',
      })
    }

  },
  toEmergencyPage: function(e) {
    var index = e.currentTarget.dataset.index
    console.log(index)
    var authorized = this.authorizeFilter();
    if (!authorized) {
      return;
    }
    this.hideLayout();
    wx.navigateTo({
      url: '../record/recordshort4e/recordshort4e?chooseTab=' + index,
    })
  },
  authorizeFilter: function() {
    //only authorized user can get platform information
    if (!app.globalData.authorized) {
      this.setData({
        showShoppingTip: true
      })
      return false;
    } else {
      return true;
    }

  },
  bindGetUserInfo: function(e) {
    wx.showLoading({
      title: '授权中',
      mask: true
    })
    var that = this;
    if (app.globalData.authorized) {

      wx.showToast({
        title: '授权成功',
        duration: 2000,
        mask: true
      })
      setTimeout(
        wx.navigateBack({
          delta: 1
        }), 2000)
      return;
    }
    //完善用户信息
    userId = app.globalData.userId;
    //login
    wx.login({
      success: res => {
        if (res.code) {
          //register new temp user
          wx.request({
            url: app.globalData.requestUrlCms + '/miniSystem/login',
            method: "GET",
            data: {
              code: res.code
            },
            dataType: "json",
            success: function(res) {
              const userId = res.data.userId;
              const openId = res.data.openId;
              const sessionKey = res.data.sessionKey;
              if (userId && typeof(userId) != 'undefined' && userId != '') {
                //授权回调函数获取用户详情    
                wx.getUserInfo({
                  withCredentials: true,
                  success: function(res) {
                    console.log(res);
                    if (res.errMsg == "getUserInfo:ok") {
                      //decrypt encrypeted userInfo
                      wx.request({
                        url: app.globalData.requestUrlCms + '/miniSystem/authorizeUser/' + userId,
                        data: {
                          encryptedData: res.encryptedData,
                          iv: res.iv,
                          sessionKey: sessionKey
                        },
                        dataType: "json",
                        method: "POST",
                        success: function(res) {
                          console.log('[bindGetUserInfo]->完善用户信息', res.data)
                          app.globalData.authorized = res.data.authorized;
                          app.globalData.userInfo = res.data.userInfo;
                          app.globalData.userId = app.globalData.userInfo.userId;
                          wx.setStorageSync("userId", app.globalData.userId)
                          wx.hideLoading();
                          wx.showToast({
                            title: '授权成功',
                            duration: 2000
                          })
                          that.setData({
                            showShoppingTip: false
                          })
                        }
                      })
                    }
                  },
                  fail: function(res) {
                    console.log(res)
                  }
                })

              } else {
                wx.showToast({
                  title: '微信功能报错,请稍后再试',
                  duration: 100000,
                  mask: true,
                })
                console.log("服务器配置微信环境出错，请检查APPID和APPSECRT是否匹配！")
              }
            }
          })
        }
      }
    })
  },
  toStoryPage: function() {
    this.hideLayout();
    wx.switchTab({
      url: '../pet/petinfo/pet',
    })
  },
  toKnowledgePage: function() {
    var authorized = this.authorizeFilter();
    if (!authorized) {
      return;
    }
    this.hideLayout();
    //判断有无缓存
    var storage = wx.getStorageSync("recordKStorage");
    if (storage != undefined && storage != null && storage != "") {
      wx.showModal({
        title: '提示',
        content: '上次有未完成的编辑，是否继续',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../record/record4k/record4k?loadState=1',
            })
          }
          if (res.cancel) {
            wx.setStorageSync("recordKStorage", "");
            wx.navigateTo({
              url: '../record/record4k/record4k',
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '../record/record4k/record4k',
      })
    }
  },
  showBtnOut: function() {
    this.setData({
      showLayOut: true
    })
  },

  hideLayout: function() {
    this.setData({
      showLayOut: false
    })
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
    console.log('onunloading...')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this
    wx.showLoading({
      title: '加载中',
    })

    //初始化
    addCoverArrayPosts = []
    imagesScrollArray = []
    contentArray = []
    pageNo = 1

    wx.request({
      url: app.globalData.requestUrlCms + '/record/charity',
      data: {
        pageNum: pageNo,
        pageSize: pageSize,
        // userId: app.globalData.userId,
        city: this.data.nowCity
      },
      method: "GET",
      dataType: "json",
      success: function(res) {
        console.log(res.data)
        var resData = res.data.data
        if (resData.length < 5) {
          bottomLast = true;
        }
        addCoverArrayPosts = addCoverArrayPosts.concat(resData);

        // 组装图片
        for (var i = 0; i < resData.length; i++) {
          //解析content内容
          var content = JSON.parse(resData[i].content);
          resData[i].content = content;
          //对内容字段进行转义
          var location = resData[i].content.location
          if (!location && typeof(location) != "undefined" && location != "") {
            if (location.length > 0) {
              location = location.substring(0, 20) + '...';
            }
            resData[i].content.location = location
          }

          var detailLocation = resData[i].content.detailLocation
          if (!detailLocation && typeof(detailLocation) != "undefined" && detailLocation != "") {
            if (detailLocation.length > 10) {
              detailLocation = detailLocation.substring(0, 10) + '...';
            }
            resData[i].content.detailLocation = detailLocation
          }

          if (resData[i].content.emergencyType == '1') {
            var lostDays = util.formatDateDiff(resData[i].content.lostDate);
            resData[i].content["lostDay"] = lostDays;
          } else if (resData[i].content.emergencyType == '2') {
            var findDays = util.formatDateDiff(resData[i].content.findDate);
            resData[i].content["findDay"] = findDays;
          }

          var record = {
            postId: resData[i].postId,
            current: 1,
            imgLength: 0
          }
          if (resData[i].images != null || resData[i].images != '') {
            record.imgLength = resData[i].images.length;
          }
          imagesScrollArray.push(record)

          contentArray.push(false);
        }
        bottomLast = false;
        that.setData({
          recordCharitylist: addCoverArrayPosts,
          imagesScrollArray: imagesScrollArray,
          contentArray: contentArray,
          bottomLast: false,
          showCharity: false,
        })
        wx.hideLoading();
      }
    })

    //开启动画效果
    var showUpdateAnimation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease-in-out',
      delay: 0
    })

    showUpdateAnimation.opacity(1).translateY(80).step()

    this.setData({
      showUpdateAnimation: showUpdateAnimation.export()
    })


    var clearShow = setTimeout(function() {
      showUpdateAnimation.opacity(0).translateY(-80).step()
      that.setData({
        showUpdateAnimation: showUpdateAnimation.export()
      })
      clearTimeout(clearShow)
    }, 1800)

    var clear = setTimeout(function() {

      wx.stopPullDownRefresh({
        success: function() {

          clearTimeout(clear)
        }
      });

    }, 800)

  },

  onPageScroll: function(obj) {

  },
  changeCity: function() {
    if (this.data.userLocationShowFlag && this.data.defaultShowFlag) {
      this.setData({
        openSwitch: true
      })
      return;
    }
    wx.getLocation({
      success: function(res) {
        console.log('getLocation', res)
      },
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: util.throttle(function() {
    var that = this
    //刷新页面
    if (!bottomLast) {
      pageNo++;
      wx.request({
        url: app.globalData.requestUrlCms + '/posts',
        data: {
          pageNum: pageNo,
          pageSize: pageSize,
          city: this.data.nowCity
        },
        method: "GET",
        dataType: "json",
        success: function(res) {
          console.log(res.data)
          var resData = res.data.data
          if (resData.length < 5) {
            bottomLast = true;
          }
          addCoverArrayPosts = addCoverArrayPosts.concat(resData);

          // 组装图片
          for (var i = 0; i < resData.length; i++) {
            //解析content内容
            var content = JSON.parse(resData[i].content);
            resData[i].content = content;
            //对内容字段进行转义
            var location = resData[i].content.location
            if (!location && typeof(location) != "undefined" && location != "") {
              if (location.length > 0) {
                location = location.substring(0, 20) + '...';
              }
              resData[i].content.location = location
            }

            var detailLocation = resData[i].content.detailLocation
            if (!detailLocation && typeof(detailLocation) != "undefined" && detailLocation != "") {
              if (detailLocation.length > 10) {
                detailLocation = detailLocation.substring(0, 10) + '...';
              }
              resData[i].content.detailLocation = detailLocation
            }

            if (resData[i].content.emergencyType == '1') {
              var lostDays = util.formatDateDiff(resData[i].content.lostDate);
              resData[i].content["lostDay"] = lostDays;
            } else if (resData[i].content.emergencyType == '2') {
              var findDays = util.formatDateDiff(resData[i].content.findDate);
              resData[i].content["findDay"] = findDays;
            }


            var record = {
              postId: resData[i].postId,
              current: 1,
              imgLength: 0
            }
            if (resData[i].images != null || resData[i].images != '') {
              record.imgLength = resData[i].images.length;
            }
            imagesScrollArray.push(record)

            contentArray.push(false);

          }
          chooseDuration = false

          that.setData({
            recordCharitylist: addCoverArrayPosts,
            imagesScrollArray: imagesScrollArray,
            contentArray: contentArray,
            bottomLast: bottomLast,
          })
        }
      })
    }else{
      that.setData({

      })
    }
  }),

  extendContent: function(e) {
    var index = e.currentTarget.dataset.index
    if (contentArray[index]) {
      contentArray[index] = false
    } else {
      contentArray[index] = true

    }

    this.setData({
      contentArray: contentArray
    })

  },

  extendContentForC: function(e) {
    var index = e.currentTarget.dataset.index
    if (contentArray[index]) {
      contentArray[index] = false
    } else {
      contentArray[index] = true

    }

    this.setData({
      contentArray: contentArray
    })

  },


  toUserhome: function(e) {
    var userId = e.currentTarget.dataset.userid
    wx.navigateTo({
      url: '../userhome/userhome?userId=' + userId,
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    var that = this;

    var image;
    var path;
    var title;
    var shareFromButton = false;
    var index;
    var type;
    var shareRecordId;


    if (res.from === 'button') {
      // 来自页面内转发按钮
      shareFromButton = true;
      shareRecordId = res.target.dataset.recordid;
      var target = res.target.dataset.target;
      type = res.target.dataset.type;
      index = res.target.dataset.index;
      var imageUrl = res.target.dataset.imageurl;
      if (imageUrl != null && imageUrl.length > 0) {
        image = photoPrefix + imageUrl[0]
      } else {
        image = ''
      }

      if (type == '0') {
        var record = addCoverArray[index];
        target = record.petName + '的新动态'
      } else if (type != '0' && type != '3') {
        var record = addCoverArray[index];
        target = record.nickName + '的新动态'
      } else if (type == '3') {
        var record = addCoverArrayPosts[index];
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

      path = '/pages/exploredetail/exploredetail?postId=' + shareRecordId + '&type=' + type;
      title = target;
    } else {
      //来自顶部转发按钮
      title = '实时发现，用心了解宠物世界！';
      path = '/pages/explore/explore';
    }
    return {
      title: title,
      path: path,
      imageUrl: image,
      success: function(res) {
        if (shareFromButton) {
          if (type == '3') {
            shareArray_c[index].shareNumber++
              that.setData({
                shareArray_c: shareArray_c
              })
          } else {
            shareArray[index].shareNumber++
              that.setData({
                shareArray: shareArray
              })
          }

          //保存转发记录
          wx.request({
            url: app.globalData.requestUrlCms + '/record/share',
            data: {
              recordId: shareRecordId,
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
    }
  },
})