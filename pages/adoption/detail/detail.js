const photoPrefix = 'https://melody.memorychilli.com/';
const util = require('../../../utils/util.js')

const app = getApp()
var userId
var petId

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    imgUrls: [],
    index: 0,
    showFilter: false,
    photoPrefix: photoPrefix,
    homeIcon:false,
    backIcon:'../../images/back-pre-black.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    petId = options.petId
    if(options.petId=='' || typeof options.petId == 'undefined' ||options.petId==null){
      petId=options.scene
      that.setData({
        homeIcon:true,
        backIcon:''
      })
    }
    userId = app.globalData.userId
    wx.showLoading({
      title: '正在加载',
    })
    wx.hideShareMenu()
  },

  getAdoptionDetail: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/pets/' + petId,
      data: {
        userId: userId
      },
      method: "GET",
      success: function(res) {
        var petInfo = res.data.data.petInfo
        var userInfo = res.data.data.userInfo
        var mediaList = petInfo.mediaList
        var petCharacteristic = petInfo.petCharacteristic
        petInfo.petCharacteristic = JSON.parse(petCharacteristic)
        petInfo.adoptRequirements = JSON.parse(petInfo.adoptRequirements)
        var images = []
        for (var i = 0; i < mediaList.length; i++) {
          images.push(photoPrefix + mediaList[i].mediaPath)
        }
        that.setData({
          petInfo: petInfo,
          imgUrls: images,
          adoptUserInfo: userInfo
        })
        wx.hideLoading()
      }
    })
  },

  getCityAdoptionList: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/pets/shanghai/list',
      data: {
        pageNum:1,
        pageSize:5,
        withOutPet: petId
      },
      method: "GET",
      success: function (res) {
        var petInfoList = res.data.data.list
        for (var i = 0; i < petInfoList.length; i++) {
          petInfoList[i].petCharacteristic = JSON.parse(petInfoList[i].petCharacteristic)
        }
        
        that.setData({
          cityAdoptionPetList: petInfoList
        })
      }
    })
  },

  detail:function(e){
    var petId = e.currentTarget.dataset.petid
    wx.navigateTo({
      url: '../detail/detail?petId=' + petId,
    })
  },

  getUserInfo: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/users/adoptUser',
      data: {
        userId: userId
      },
      method: "GET",
      success: function(res) {
        var adoptUserInfo = res.data.data
        that.setData({
          adoptUserInfo: adoptUserInfo
        })
      }
    })
  },

  swiper: function(e) {
    var index = e.detail.current
    this.setData({
      index: index
    })
  },
  copyWx: function(e) {
    app.IfAccess().then(function(res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          var wxId = e.currentTarget.dataset.wx
          if (wxId == '') {
            return
          }
          wx.setClipboardData({
            data: wxId,
            success(res) {
              wx.showToast({
                title: '复制成功',
                icon: 'success',
                duration: 2000
              })
            }
          })
        } else {
          that.setData({
            showFilter: true
          })
        }
      }
    })

  },
  call: function(e) {
    app.IfAccess().then(function(res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          var phone = e.currentTarget.dataset.phone
          if (phone == '') {
            return
          }

          wx.makePhoneCall({
            phoneNumber: phone // 仅为示例，并非真实的电话号码
          })
        } else {
          that.setData({
            showFilter: true
          })
        }
      }
    })
  },
  home: function(e) {
    var targetUserId = e.currentTarget.dataset.userid
    wx.navigateTo({
      url: '../../mine/home/home?userId=' + targetUserId,
    })
  },
  report: function() {
    var that = this
    app.IfAccess().then(function(res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          wx.showActionSheet({
            itemList: ['广告信息', '诈骗信息', '虚假信息'],
            success(res) {
              console.log(res.tapIndex)
              wx.request({
                url: app.globalData.requestUrlCms + '/adopt/reports', // 仅为示例，并非真实的接口地址
                data: {
                  petId: that.data.petInfo.petId,
                  reportType: res.tapIndex,
                  userId: userId
                },
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                success(res) {
                  console.log(res.data)
                  if (res.data.success) {
                    wx.showToast({
                      title: '举报成功，平台将会对此信息进行审核。',
                      icon: 'none',
                      duration: 4000
                    })
                  }
                }
              })
            },
            fail(res) {
              console.log(res.errMsg)
            }
          })
        } else {
          that.setData({
            showFilter: true
          })
        }
      }
    })
  },
  modify: function() {
    var that = this
    app.IfAccess().then(function(res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          wx.navigateTo({
            url: '../../post/adopt/adopt?loadState=1&petId=' + that.data.petInfo.petId,
          })
        } else {
          that.setData({
            showFilter: true
          })
        }
      }
    })
  },
  apply: function() {
    var that = this
    app.IfAccess().then(function(res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          wx.navigateTo({
            url: '../../post/apply/apply?petId=' + that.data.petInfo.petId,
          })
        } else {
          that.setData({
            showFilter: true
          })
        }
      }
    })
  },
  collect: function(e) {
    var that = this
    app.IfAccess().then(function(res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          var id = e.currentTarget.dataset.collect
          if (id == 1) {
            wx.request({
              url: app.globalData.requestUrlCms + '/adopt/pets/collect', // 仅为示例，并非真实的接口地址
              data: {
                petId: that.data.petInfo.petId,
                userId: userId
              },
              method: 'POST',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success(res) {
                console.log(res.data)
                if (res.data.success) {
                  that.data.petInfo.collected = true
                  that.setData({
                    petInfo: that.data.petInfo
                  })
                }
              }
            })
          } else {
            wx.request({
              url: app.globalData.requestUrlCms + '/adopt/pets/collect', // 仅为示例，并非真实的接口地址
              data: {
                petId: that.data.petInfo.petId,
                userId: userId
              },
              method: 'DELETE',
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },
              success(res) {
                console.log(res.data)
                if (res.data.success) {
                  that.data.petInfo.collected = false
                  that.setData({
                    petInfo: that.data.petInfo
                  })
                }
              }
            })
          }
        } else {
          that.setData({
            showFilter: true
          })
        }
      }
    })
  },
  previewImg: function(e) {
    var imgurls = this.data.imgUrls

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
  chat: function(e) {
    var that = this
    app.IfAccess().then(function(res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          var userId = e.currentTarget.dataset.userid
          wx.navigateTo({
            url: '../../adoption/chat/chat?userId=' + userId,
          })
        } else {
          that.setData({
            showFilter: true
          })
        }
      }
    })
  },
  cancelLogin: function() {
    this.setData({
      showFilter: false
    })
  },
  bindGetUserInfo: function(e) {
    if (e.detail.errMsg == 'getUserInfo:fail auth deny') {
      return
    }
    wx.showLoading({
      title: '登录中',
      mask: true
    })
    var that = this;
    if (app.globalData.authorized) {
      wx.showToast({
        title: '登录成功',
        duration: 2000,
        mask: true
      })
      that.setData({
        showFilter: false,
        isAuthorized: true,
        userInfo: app.globalData.userInfo
      })
      return;
    }
    //完善用户信息
    userId = app.globalData.userId;
    //login
    wx.login({
      success: res => {
        if (res.errMsg != 'getUserInfo:fail:auth deny' && res.code) {
          //register new temp user
          wx.request({
            url: app.globalData.requestUrlWechat + '/miniSystem/login',
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
                        url: app.globalData.requestUrlWechat + '/miniSystem/authorizeUser/' + userId,
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
                            showFilter: false,
                            isAuthorized: true,
                            userInfo: app.globalData.userInfo,
                          })
                        }
                      })
                    }
                  },
                  fail: function(res) {
                    wx.showToast({
                      title: '登录失败，请点击我的底部栏，来到个人中心吐个槽',
                    })
                    console.log(res)
                  }
                })

              } else {
                wx.showToast({
                  title: '登录失败，请点击我的底部栏，来到个人中心吐个槽',
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
  sharePost:function(e){
    var formId=e.detail.formId
    this.genFormId(formId)
    wx.showLoading({
      title: '生成海报中',
    })
    wx.navigateTo({
      url: '../share/share?petId='+petId,
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
      success: function (res) {
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
    var that = this
    userId = app.globalData.userId
    if (typeof userId != 'undefined' && userId) {
      that.setData({
        userId: userId
      })
      this.getAdoptionDetail()
      this.getCityAdoptionList()
    } else {
      app.IfAccess().then(function(res) {
        if (res) {
          userId = app.globalData.userId;
          if (userId && typeof(userId) != 'undefined' && userId != '') {
            that.setData({
              userId: userId
            })
            that.getAdoptionDetail()
            that.getCityAdoptionList()
          }
        }
      })
    }
  },
  online: function(e) {
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
        wx.showToast({
          title: '上线成功',
          icon: 'none',
          duration: 2000
        })
        that.getAdoptionDetail()
      }
    })
  },
  offline: function(e) {
    wx.showLoading({
      title: '操作中',
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
        wx.hideLoading()
        wx.showToast({
          title: '下线成功',
          icon: 'none',
          duration: 2000
        })
        that.getAdoptionDetail()
      }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '我叫'+this.data.petInfo.petName+"，快把我带回家吧！",
      imageUrl: this.data.imgUrls[0],
      path: '/pages/adoption/detail/detail?scene='+petId
    }
  }
})