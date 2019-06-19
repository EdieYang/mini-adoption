const app = getApp();

var QQMapWX = require('../../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
var latitude_now;
var longitude_now;
var detailAddress;
var markers = []

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    address: '',
    formatted_addresses: '',
    address_reference: '',
    showSuggestInfos: false,
    markers: [],
    chooseCity: '',
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标
      title: '邻宠.选择地点', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    qqmapsdk = new QQMapWX({
      key: '4SOBZ-N4Z6P-2WEDV-V3NWZ-U25BF-IOBCM' //APPKEY
    });
    //创建地图引擎
    this.mapCtx = wx.createMapContext('mapSys');
    //移动到用户定位点
    this.mapCtx.moveToLocation();
    //获取当前地理位置
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        latitude_now = res.latitude
        longitude_now = res.longitude
        that.reverseGeoCoder();
      }
    })
  },
  reverseGeoCoder: function () {
    var that = this
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude_now,
        longitude: longitude_now
      },
      success: function (res) {
        console.log(res);
        var city = res.result.ad_info.city;
        that.setData({
          address: res.result.address,
          formatted_addresses: res.result.formatted_addresses,
          address_reference: res.result.address_reference,
          city: city
        })

      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },

  searchLocation: function () {
    var that = this
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        var lat = res.latitude
        var lng = res.longitude

        //再地图上设置marker
        markers = []
        //绘制坐标系
        var tempMarker = {
          id: 1,
          latitude: lat,
          longitude: lng,
          iconPath: "../../images/icon_bar/help.png",
          width: 70,
          height: 70
        }
        markers.push(tempMarker);


        //逆地址解析
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude_now,
            longitude: longitude_now
          },
          success: function (res) {
            console.log(res);
            var city = res.result.ad_info.city;
            that.setData({
              chooseCity: city
            })
          }
        })
        var address = res.address
        var title = res.name
        latitude_now = lat;
        longitude_now = lng;
        that.setData({
          markers: markers,
          address: address,
          title: title,
          showSuggestInfos: false
        })
      },
    })
  },

  relocate: function () {
    this.mapCtx.moveToLocation();
  },

  submitLocationInfo: function (event) {
    //判断选定的地址与当前定位位置是否在一个城市
    var chooseCity = this.data.chooseCity
    var city = this.data.city

    if (chooseCity == '') {
      chooseCity = city; //默认选择定位位置
    }
    if (chooseCity != '' && chooseCity != city) {
      wx.showToast({
        title: '发布的紧急事件必须在您当前所在的城市中，请重新选择！',
        icon: 'none',
        mask: true,
        duration: 2000
      })
      return;
    }

    var detailAddress = event.detail.value.detailForm

    if (this.data.address == '' || chooseCity == '' || latitude_now == '' || longitude_now == '') {
      wx.showToast({
        title: '请选择地点',
        icon: 'none',
        duration: 1500
      })
      return;
    }

    var title = this.data.title;
    var addressDetail = this.data.address;
    if (title != '' && title != addressDetail) {
      addressDetail = '(' + title + ') ' + addressDetail
    }
    var chooseLocationInfo = {
      address: addressDetail,
      detailAddress: detailAddress,
      lat: latitude_now,
      lng: longitude_now,
      city: chooseCity,
      select: true
    }

    wx.setStorage({
      key: 'droplocation',
      data: chooseLocationInfo,
      success: function () {
        wx.navigateBack({
          delta: 1
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})