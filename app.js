var requestUrl;
var requestUrlWechat;
var requestUrlCms;
var uploadPortraitUrl;

App({
  globalData: {
    authorized: false,
    userInfo: null,
    userId: '',
    openId: '',
    share: false, // 分享默认为false
    height: 0,
    top:0,
    model: '',
    entranceScene: '',
    // requestUrl: 'https://www.linchongpets.com/lpCms',
    requestUrlCms: 'https://www.linchongpets.com/lpCms',
    requestUrlWechat: 'https://www.linchongpets.com/lpWechat',
    uploadUrl: 'https://www.linchongpets.com/lpCms/pet/portrait/upload',
    uploadImageUrl: 'https://www.linchongpets.com/lpCms/oss/image',
    staticResourceUrlPrefix: 'https://linkpet-image-bucket-1.oss-cn-hangzhou.aliyuncs.com',
    // requestUrlCms: 'http://localhost:8093/lpCms',
    // requestUrlWechat: 'http://localhost:8094/lpWechat',
    // uploadUrl: 'http://localhost:8093/pokemon/pet/portrait/upload',
    // uploadImageUrl: 'http://localhost:8093/lpCms/oss/image',
  },
  onLaunch: function(options) {
    console.log("linkpets.miniapp.launching.....")
    var that = this
    // 判断是否由分享进入小程序
    if (options.scene == 1007 || options.scene == 1008) {
      this.globalData.share = true
    } else {
      this.globalData.share = false
    }

    //获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
    var sysinfo = wx.getSystemInfoSync(),
      navinfo = wx.getMenuButtonBoundingClientRect(),
      statusHeight = sysinfo.statusBarHeight,
      isiOS = sysinfo.system.indexOf('iOS') > -1,
      navHeight;
    if (!isiOS) {
      navHeight = 48;
    } else {
      navHeight = 44;
    }
    that.globalData.marginNav = statusHeight + navHeight
  },

  IfAccess: function() {
    var that = this
    return new Promise(function(resolve, reject) {
      var userId = wx.getStorageSync("userId")
      // const userId = '062b42c7997348b398719f8ff8ebc8e4'
      //put userId into global variable dataset
      that.globalData.userId = userId;
      //define api request url
      requestUrl = that.globalData.requestUrl;
      requestUrlWechat = that.globalData.requestUrlWechat;
      wx.checkSession({
        success: function() {
          if (userId && typeof(userId) != 'undefined' && userId != '') {
            that.checkIfUserAuthorized(userId, resolve);
          } else {
            //do login progress to get openId
            that.doLogin(resolve);
          }
        },
        fail: function() {
          // session_key invalid and do relogin progress
          that.doLogin(resolve);
        }
      })
    })
  },

  doLogin: function(resolve) {
    var that = this;
    wx.login({
      success: res => {
        if (res.code) {
          //register new temp user
          wx.request({
            url: requestUrlWechat + '/miniSystem/login',
            method: "GET",
            data: {
              code: res.code
            },
            dataType: "json",
            success: function(res) {
              const userId = res.data.userId;
              if (userId && typeof(userId) != 'undefined' && userId != '') {
                that.checkIfUserAuthorized(userId, resolve);
              } else {
                console.log("服务器配置微信环境出错，请检查APPID和APPSECRT是否匹配！")
              }
            }
          })
        } else {
          //reboot miniapp
          wx.navigateBack({
            delta: 1
          })
        }
      }
    })
  },

  checkIfUserAuthorized: function(userId, resolve) {
    var that = this
    wx.request({
      url: requestUrlWechat + '/miniSystem/checkIfUserAuthorized',
      method: "GET",
      data: {
        userId: userId
      },
      dataType: "json",
      success: function(res) {
        var resData = res.data;
        that.globalData.authorized = resData.authorized
        if (resData.authorized) {
          that.globalData.userInfo = resData.userInfo;
          that.globalData.userId = resData.userInfo.userId;
          wx.setStorageSync("userId", userId);
        } else {
          wx.setStorageSync("userId", userId);
          that.globalData.userId = userId;
        }
        resolve(true);
      }
    })
  },
  onShow: function(options) {
    let option = JSON.stringify(options);
    this.globalData.entranceScene = options.scene;
  }
})