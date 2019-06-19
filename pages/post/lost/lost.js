var util = require('../../../utils/util.js');
var userId;
var petId;
const app = getApp()

const photoPrefix = 'https://melody.memorychilli.com/'

var content = '';
var ImageUrls = [];
var showLocationHistory = true
var showMenu;
var chooseTab;

//表单数据初始化
var petName = '';
var breed = '';
var wxAccount = '';
var phone = '';
var specialPoint = '';
var detailInfo = '';
var reward = 0;
var droplocation = '';
var recordId = '';


var showAddPhotoCover = true; //是否显示增加图片框
var imgCount = 0; //已显示照片数
var modifyFlag = false;
var keepStorage = false;

var loadState;
var chooseTab;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:'',
    photoPrefix: photoPrefix,
    ImageUrls: [],
    content: '',
    showAddPhotoCover: showAddPhotoCover,
    ageRange: ['不详', '0-3个月', '4-6个月', '7-12个月', '1岁', '2岁', '3岁', '4岁', '5岁', '6岁', '7岁', '8岁', '9岁', '10岁', '11岁', '12岁', '13岁', '14岁', '15岁', '16岁', '17岁', '18岁', '19岁', '20岁'],
    agePickVal: '请选择',
    date: getNowFormatDate(),
    speciesType: '',
    showMenu: true,
    hasArea: false,
    dateEnd: getNowFormatDate(),
    currentDetailWordNumber: 100,
    currentSpecialWordNumber: 100,
    immuneType: '',
    sterilizeType: '',
    nvabarData: {
      showCapsule: 0, //是否显示左上角图标
      showCapsuleSingle: 1, //是否显示左上角图标
      showIndex: false,
      title: '发布寻宠信息', //导航栏 中间的标题
      background: '#fff',
      color: '#2d2d2d',
      share: true
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    //判断是否加载缓存
    var that = this
    userId = app.globalData.userId
    loadState = options.loadState
    chooseTab = options.chooseTab

    if (chooseTab == '0') {
      this.checkStorage(0);
    } else {
      this.checkStorage(1);
    }



    console.log(options)
    if (loadState == 2) {
      modifyFlag = true
      showLocationHistory = false
      var storage = wx.getStorageSync("recordEmergencyStorageModify");
      ImageUrls = storage.ImageUrls
      content = JSON.parse(storage.content)
      var emergencyType = content["emergencyType"]
      if (emergencyType == '1') {
        that.setData({
          showMenu: false,
          chooseTab: 0
        })
      } else {
        that.setData({
          showMenu: false,
          chooseTab: 1
        })
      }
      droplocation = storage.droplocation
      droplocation.select = true
      recordId = storage.recordId
      that.showLocalHistory(content);
    } else {
      petName = '';
      breed = '';
      wxAccount = '';
      phone = '';
      specialPoint = '';
      detailInfo = '';
      droplocation = '';
      recordId = '';
      ImageUrls = [];
      this.setData({
        //未从缓存读取本页，将图片数组清空
        ImageUrls: [],
        chooseTab: chooseTab
      })
    }

    //获取用户信息
    // this.getUserDetail()
    this.setData({
      chooseTab: chooseTab,
      userInfo:app.globalData.userInfo
    })
  },
  getUserDetail() {
    var that = this
    wx.request({
      url: app.globalData.requestUrl + '/user/' + userId,
      dataType: "json",
      method: "GET",
      success: function (res) {
        console.log('[bindGetUserInfo]->获取用户信息', res.data.data)
        that.setData({
          nickName: res.data.data.user.nickName,
          photoPath: res.data.data.user.photoPath
        })
      }
    })
  },

  showLocalHistory: function (content) {
    var that = this;
    petName = content.petName;
    var speciesType = content.speciesType;
    breed = content.breed;
    var agePickVal = content.agePickVal;
    var genderType = content.genderType;
    var regionArr = content.regionArr;
    wxAccount = content.wxAccount;
    phone = content.phone;
    var date = content.lostDate;
    var sterilizeType = content.sterilizeType;
    var immuneType = content.immuneType;
    var chipType = content.chipType;
    specialPoint = content.specialPoint;
    detailInfo = content.detailInfo;
    reward = content.reward;

    if (speciesType == '狗狗') {
      speciesType = 1;
    } else if (speciesType == '猫咪') {
      speciesType = 2;
    }

    if (genderType == '男孩') {
      genderType = 2;
    } else if (genderType == '女孩') {
      genderType = 3;
    } else if (genderType == '未知') {
      genderType = 1;
    }

    if (sterilizeType == '已绝育') {
      sterilizeType = 1;
    } else if (sterilizeType == '未绝育') {
      sterilizeType = 2;
    } else if (sterilizeType == '未知') {
      sterilizeType = 3;
    }

    if (immuneType == '已免疫') {
      immuneType = 1;
    } else if (immuneType == '未免疫') {
      immuneType = 2;
    } else if (immuneType == '未知') {
      immuneType = 3;
    }


    if (chipType == '有芯片') {
      chipType = 1;
    } else if (chipType == '无芯片') {
      chipType = 2;
    } else if (chipType == '未知') {
      chipType = 3;
    } else {
      chipType = "";
    }

    if (typeof (regionArr) == "undefined") {
      regionArr = [];
    }

    that.setData({
      content: content,
      ImageUrls: ImageUrls,
      droplocation: droplocation,
      recordId: recordId,
      petName: petName,
      speciesType: speciesType,
      breed: breed,
      agePickVal: agePickVal,
      genderType: genderType,
      region: regionArr,
      wxAccount: wxAccount,
      phone: phone,
      date: date,
      sterilizeType: sterilizeType,
      immuneType: immuneType,
      chipType: chipType,
      specialPoint: specialPoint,
      detailInfo: detailInfo,
      reward: reward,
      hasArea: true
    })
  },


  checkStorage: function (index) {
    var that = this;
    if (index == 0) {
      //判断有无缓存
      var storage = wx.getStorageSync("recordEmergencyStorageLost");
      if (storage != undefined && storage != null && storage != "") {
        wx.showModal({
          title: '提示',
          content: '上次有未完成的编辑，是否继续',
          success: function (res) {
            if (res.confirm) {
              showLocationHistory = false
              ImageUrls = storage.ImageUrls
              content = JSON.parse(storage.content)
              droplocation = storage.droplocation
              if (droplocation != "") {
                droplocation.select = true
              }

              that.showLocalHistory(content);
            }
            if (res.cancel) {
              showLocationHistory = false
              ImageUrls = []
              wx.setStorageSync("recordEmergencyStorageLost", "");
              wx.setStorageSync("droplocation", "")
              that.setData({
                loadState: ''
              })
            }
          }
        })
      }
    } else {
      //判断有无缓存
      var storage = wx.getStorageSync("recordEmergencyStorageFind");
      if (storage != undefined && storage != null && storage != "") {
        wx.showModal({
          title: '提示',
          content: '上次有未完成的编辑，是否继续',
          success: function (res) {
            if (res.confirm) {
              showLocationHistory = false
              ImageUrls = storage.ImageUrls
              content = JSON.parse(storage.content)
              droplocation = storage.droplocation
              if (droplocation != "") {
                droplocation.select = true
              }

              that.showLocalHistory(content);
            }
            if (res.cancel) {
              showLocationHistory = false
              ImageUrls = []
              wx.setStorageSync("recordEmergencyStorageFind", "");
              wx.setStorageSync("droplocation", "")
              that.setData({
                loadState: ''
              })
            }
          }
        })
      }
    }

  },
  chooseSpecies: function (e) {
    var species = e.currentTarget.dataset.type;
    if (species == 1) {
      this.setData({
        speciesType: 1
      })
    } else {
      this.setData({
        speciesType: 2
      })
    }
  },
  bindAgeRange: function (e) {
    var index = e.detail.value;
    var agePickValArr = this.data.ageRange;
    var agePickVal = agePickValArr[index];
    this.setData({
      agePickVal: agePickVal
    })
  },
  chooseGender: function (e) {
    var gender = e.currentTarget.dataset.type;
    if (gender == 1) {
      this.setData({
        genderType: 1
      })
    } else if (gender == 2) {
      this.setData({
        genderType: 2
      })
    } else {
      this.setData({
        genderType: 3
      })
    }
  },
  bindRegionChange: function (e) {
    console.log(e.detail.value);
    this.setData({
      region: e.detail.value,
      hasArea: true
    })
  },
  chooseSterilize: function (e) {
    var sterilize = e.currentTarget.dataset.type;
    if (sterilize == 1) {
      this.setData({
        sterilizeType: 1
      })
    } else if (sterilize == 2) {
      this.setData({
        sterilizeType: 2
      })
    } else {
      this.setData({
        sterilizeType: 3
      })
    }
  },
  chooseImmune: function (e) {
    var immune = e.currentTarget.dataset.type;
    if (immune == 1) {
      this.setData({
        immuneType: 1
      })
    } else if (immune == 2) {
      this.setData({
        immuneType: 2
      })
    } else {
      this.setData({
        immuneType: 3
      })
    }
  },
  chooseChip: function (e) {
    var chip = e.currentTarget.dataset.type;
    if (chip == 1) {
      this.setData({
        chipType: 1
      })
    } else if (chip == 2) {
      this.setData({
        chipType: 2
      })
    } else {
      this.setData({
        chipType: 3
      })
    }
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  bindblur: function (e) {
    textareaContent = e.detail.value
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    var that = this
    keepStorage = false
    if (showLocationHistory) {
      var storage = wx.getStorageSync('droplocation')
      that.setData({
        droplocation: storage
      })
    }
  },
  addPhoto: function () {
    var that = this;
    imgCount = 0;
    for (var i = 0; i < ImageUrls.length; i++) {
      if (ImageUrls[i].notDeleted) {
        imgCount++;
      }
    }
    wx.chooseImage({
      count: 6 - imgCount, // 默认9
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showToast({
          title: '上传中',
          icon: 'loading',
          duration: 20000
        })

        //执行上传递归函数

        var successUp = 0; //成功个数
        var failUp = 0; //失败个数
        var length = res.tempFilePaths.length; //总共个数
        var i = 0; //第几个
        that.uploadDIY(res.tempFilePaths, successUp, failUp, i, length);
      }
    })
  },
  uploadDIY(filePaths, successUp, failUp, i, length) {
    var that = this
    wx.uploadFile({
      url: app.globalData.uploadImageUrl,
      filePath: filePaths[i],
      name: 'file',
      formData: {
        'userId': userId,
        'ossZone': 'losts'
      },
      success: (resp) => {
        successUp++;
        wx.hideToast();
        wx.showToast({
          title: '上传中' + successUp + '/' + length,
          icon: 'loading',
          duration: 20000
        })
        var returnUrl = JSON.parse(resp.data);
        var picUrl = returnUrl.data
        //添加数组中去
        var tempCover = {
          notDeleted: true,
          data: picUrl
        };
        ImageUrls.push(tempCover);
        that.setData({
          ImageUrls: ImageUrls
        })

      },
      fail: (res) => {
        failUp++;
      },
      complete: () => {
        i++;
        if (i == length) {
          if (length + imgCount == 6) {
            showAddPhotoCover = false;
            that.setData({
              showAddPhotoCover: showAddPhotoCover
            })
          }
          wx.hideToast();
        } else { //递归调用uploadDIY函数
          that.uploadDIY(filePaths, successUp, failUp, i, length);
        }
      },
    });
  },
  delImg: function (event) {
    var index = event.currentTarget.dataset.index;
    ImageUrls[index].notDeleted = false;
    showAddPhotoCover = true;
    this.setData({
      ImageUrls: ImageUrls,
      showAddPhotoCover: showAddPhotoCover
    })

  },
  toMapLocate: function () {
    showLocationHistory = true
    wx.navigateTo({
      url: '../maplocate/maplocate',
    })
  },
  verifyPhone: function (event) {
    var phone = event.detail.value
    if (!(/^1(3|4|5|7|8)\d{9}$/.test(phone))) {
      wx.showToast({
        title: '请输入正确的手机号',
        duration: 1000,
        icon: 'none'
      })
      return;
    }
  },

  submitNew: function (e) {
    var that = this
    wx.showLoading({
      title: '正在发布',
    })

    //获取表单数据
    var petName = e.detail.value.petName;
    if (this.checkEmptyVar(petName)) {
      wx.showToast({
        title: '须填写宠物名字',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var speciesType = this.data.speciesType;
    if (this.checkEmptyVar(speciesType)) {
      wx.showToast({
        title: '须选择宠物类别',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (speciesType == '1') {
      speciesType = '狗狗'
    } else {
      speciesType = '猫咪'
    }

    var breed = e.detail.value.breed;
    if (this.checkEmptyVar(breed)) {
      wx.showToast({
        title: '须填写宠物品种',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var agePickVal = this.data.agePickVal;
    if (this.checkEmptyVar(agePickVal)) {
      wx.showToast({
        title: '须选择宠物年龄',
        icon: 'none',
        duration: 2000
      })
      return;
    }


    var genderType = this.data.genderType;
    if (this.checkEmptyVar(genderType)) {
      wx.showToast({
        title: '须选择宠物性别',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (genderType == '1') {
      genderType = '未知'
    } else if (genderType == '2') {
      genderType = '男孩'
    } else {
      genderType = '女孩'
    }


    var region = this.data.region;
    if (this.checkEmptyVar(region)) {
      wx.showToast({
        title: '须选择所在地',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var regionArr = region

    var regionDetail = region[0] + ' ' + region[1] + ' ' + region[2]


    var wxAccount = e.detail.value.wxAccount;


    var phone = e.detail.value.phone;
    if (this.checkEmptyVar(phone)) {
      wx.showToast({
        title: '须填写手机号',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (!(/^1(3|4|5|7|8)\d{9}$/.test(phone))) {
      wx.showToast({
        title: '请输入正确的手机号',
        duration: 1000,
        icon: 'none'
      })
      return;
    }



    var droplocationTemp = this.data.droplocation
    var location = droplocationTemp.address;
    var detailLocation = droplocationTemp.detailAddress;
    var lat = droplocationTemp.lat;
    var lng = droplocationTemp.lng
    var city = droplocationTemp.city

    if (droplocationTemp == undefined || location == undefined || detailLocation == undefined || lat == '' || lng == '' || city == '') {

      wx.showToast({
        title: '须选择丢失地点',
        icon: 'none',
        duration: 1500
      })
      return;
    }

    var date = this.data.date;


    var sterilizeType = this.data.sterilizeType;
    if (this.checkEmptyVar(sterilizeType)) {
      wx.showToast({
        title: '须选择是否绝育',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (sterilizeType == '1') {
      sterilizeType = '已绝育'
    } else if (sterilizeType == '2') {
      sterilizeType = '未绝育'
    } else {
      sterilizeType = '未知'
    }


    var immuneType = this.data.immuneType;
    if (this.checkEmptyVar(immuneType)) {
      wx.showToast({
        title: '须选择是否免疫',
        icon: 'none',
        duration: 2000
      })
      return;
    }


    if (immuneType == '1') {
      immuneType = '已免疫'
    } else if (immuneType == '2') {
      immuneType = '未免疫'
    } else {
      immuneType = '未知'
    }



    var chipType = this.data.chipType;
    if (this.checkEmptyVar(chipType)) {
      wx.showToast({
        title: '须选择是否有芯片',
        icon: 'none',
        duration: 2000
      })
      return;
    }


    if (chipType == '1') {
      chipType = '有芯片'
    } else if (chipType == '2') {
      chipType = '无芯片'
    } else {
      chipType = '未知'
    }

    var specialPoint = e.detail.value.specialPoint;
    if (this.checkEmptyVar(specialPoint) || util.trimString(specialPoint) == '') {
      wx.showToast({
        title: '须填写宠物特征描述',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var detailInfo = e.detail.value.detailInfo;
    if (this.checkEmptyVar(detailInfo) || util.trimString(detailInfo) == '') {
      wx.showToast({
        title: '须填写宠物详情描述',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var reward = e.detail.value.reward;


    var content = {
      emergencyType: '1', //丢失类型
      petName: petName,
      speciesType: speciesType,
      breed: breed,
      agePickVal: agePickVal,
      genderType: genderType,
      regionArr: regionArr,
      regionDetail: regionDetail,
      wxAccount: wxAccount,
      phone: phone,
      lostDate: date,
      sterilizeType: sterilizeType,
      immuneType: immuneType,
      chipType: chipType,
      specialPoint: specialPoint,
      detailInfo: detailInfo,
      reward: reward
    }


    var imageArr = [];
    for (var i = 0; i < ImageUrls.length; i++) {
      if (ImageUrls[i].notDeleted) {
        imageArr.push(ImageUrls[i].data)
      }
    }

    if (imageArr.length == 0) {
      wx.showToast({
        title: '须上传宠物照片',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var postId = '';
    if (modifyFlag) {
      postId = that.data.postId
      wx.request({
        url: app.globalData.requestUrlCms + '/lost/posts/post',
        data: {
          userId: userId,
          postId: postId,
          content: JSON.stringify(content),
          images: JSON.stringify(imageArr),
          location: location,
          detailLocation: detailLocation,
          lat: lat,
          lng: lng,
          city: city
        },
        method: "PUT",
        dataType: "json",
        success: function (res) {
          wx.hideLoading();
          //删除缓存
          wx.setStorageSync("recordEmergencyStorageLost", "")
          wx.setStorageSync("droplocation", "")
          keepStorage = true
          wx.redirectTo({
            url: '../recordlist/recordlist?chosenId=2',
          })
        }
      })
    }else{
      wx.request({
        url: app.globalData.requestUrlCms + '/lost/posts/post',
        data: {
          userId:userId,
          content: JSON.stringify(content),
          images: JSON.stringify(imageArr),
          location: location,
          detailLocation: detailLocation,
          lat: lat,
          lng: lng,
          city: city
        },
        method: "POST",
        dataType: "json",
        success: function (res) {
          wx.hideLoading();
          //删除缓存
          wx.setStorageSync("recordEmergencyStorageLost", "")
          wx.setStorageSync("droplocation", "")
          keepStorage = true
          wx.redirectTo({
            url: '../recordlist/recordlist?chosenId=2',
          })
        }
      })
    }
    

    
  },

  submitNewFind: function (e) {
    var that = this
    wx.showLoading({
      title: '正在发布',
    })

    //获取表单数据
    var petName = '';

    var speciesType = this.data.speciesType;
    if (this.checkEmptyVar(speciesType)) {
      wx.showToast({
        title: '须选择宠物类别',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (speciesType == '1') {
      speciesType = '狗狗'
    } else {
      speciesType = '猫咪'
    }

    var breed = e.detail.value.breed;
    if (this.checkEmptyVar(breed)) {
      wx.showToast({
        title: '须填写宠物品种（可填写未知）',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var agePickVal = this.data.agePickVal;
    if (this.checkEmptyVar(agePickVal)) {
      wx.showToast({
        title: '须选择宠物年龄',
        icon: 'none',
        duration: 2000
      })
      return;
    }


    var genderType = this.data.genderType;
    if (this.checkEmptyVar(genderType)) {
      wx.showToast({
        title: '须选择宠物性别',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (genderType == '1') {
      genderType = '未知'
    } else if (genderType == '2') {
      genderType = '男孩'
    } else {
      genderType = '女孩'
    }


    var region = this.data.region;
    if (this.checkEmptyVar(region)) {
      wx.showToast({
        title: '须选择所在地',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var regionArr = region

    var regionDetail = region[0] + ' ' + region[1] + ' ' + region[2]


    var wxAccount = e.detail.value.wxAccount;


    var phone = e.detail.value.phone;
    if (this.checkEmptyVar(phone)) {
      wx.showToast({
        title: '须填写手机号',
        icon: 'none',
        duration: 2000
      })
      return;
    }



    var droplocationTemp = this.data.droplocation
    var location = droplocationTemp.address;
    var detailLocation = droplocationTemp.detailAddress;
    var lat = droplocationTemp.lat;
    var lng = droplocationTemp.lng
    var city = droplocationTemp.city

    if (droplocationTemp == undefined || location == undefined || detailLocation == undefined || lat == '' || lng == '' || city == '') {

      wx.showToast({
        title: '须选择发现地点',
        icon: 'none',
        duration: 1500
      })
      return;
    }

    var date = this.data.date;





    var detailInfo = e.detail.value.detailInfo;
    if (this.checkEmptyVar(detailInfo) || util.trimString(detailInfo) == '') {
      wx.showToast({
        title: '须填写宠物详情描述',
        icon: 'none',
        duration: 2000
      })
      return;
    }


    var content = {
      emergencyType: '2', //寻主类型
      speciesType: speciesType,
      breed: breed,
      agePickVal: agePickVal,
      genderType: genderType,
      regionArr: regionArr,
      regionDetail: regionDetail,
      wxAccount: wxAccount,
      phone: phone,
      findDate: date,
      detailInfo: detailInfo
    }


    var imageArr = [];
    for (var i = 0; i < ImageUrls.length; i++) {
      if (ImageUrls[i].notDeleted) {
        imageArr.push(ImageUrls[i].data)
      }
    }

    if (imageArr.length == 0) {
      wx.showToast({
        title: '须上传宠物照片',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var recommendState = 0; //默认推荐
    var recordId = '';
    if (modifyFlag) {
      recordId = that.data.recordId
    }
    wx.request({
      url: app.globalData.requestUrl + '/record/shortRecord/' + userId,
      data: {
        recordId: recordId,
        content: JSON.stringify(content),
        images: JSON.stringify(imageArr),
        recommendState: recommendState,
        location: location,
        detailLocation: detailLocation,
        lat: lat,
        lng: lng,
        city: city,
        type: '3',
      },
      method: "POST",
      dataType: "json",
      success: function (res) {
        wx.hideLoading();
        //删除缓存
        wx.setStorageSync("recordEmergencyStorageFind", "")
        wx.setStorageSync("droplocation", "")
        keepStorage = true
        wx.redirectTo({
          url: '../recordlist/recordlist?chosenId=2',
        })
      }
    })
  },





  checkEmptyVar: function (param) {
    if (!param || typeof (param) == 'undefined' || param == "") {
      return true;
    } else {
      return false;
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  nameInput: function (event) {
    petName = event.detail.value;
  },
  breedInput: function (event) {
    breed = event.detail.value;
  },
  wxAccountInput: function (event) {
    wxAccount = event.detail.value;
  },
  phoneInput: function (event) {
    phone = event.detail.value;
  },
  specialPointInput: function (event) {
    specialPoint = event.detail.value;
    // 获取输入框的内容
    var value = event.detail.value;
    // 获取输入框内容的长度
    var len = parseInt(value.length);


    //最多字数限制
    if (len > 100) {
      value = value.substring(0, 100);
      this.setData({
        specialPoint: value,
        currentSpecialWordNumber: 100 - value.length
      })
      return;
    }
    // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
    this.setData({
      currentSpecialWordNumber: 100 - len //当前字数
    });
  },
  detailInfoInput: function (event) {
    detailInfo = event.detail.value;
    // 获取输入框的内容
    var value = event.detail.value;
    // 获取输入框内容的长度
    var len = parseInt(value.length);


    //最多字数限制
    if (len > 100) {
      value = value.substring(0, 100);
      this.setData({
        detailInfo: value,
        currentDetailWordNumber: 100 - value.length
      })
      return;
    }
    // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
    this.setData({
      currentDetailWordNumber: 100 - len //当前字数
    });
  },
  rewardInput: function (e) {
    var pattern = /(^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$)/;
    var regMoney = pattern.test(e.detail.value)

    if (!regMoney) {
      wx.showToast({
        title: '请输入正确数字',
        duration: 1000,
        mask: true,
        icon: 'none'
      })
      return '';
    }

    reward = e.detail.value
  },

  cancelPublish: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this;
    if (keepStorage) {
      return;
    }
    if (loadState == 2) {
      return;
    }

    //判断是否需要弹出保存框
    var speciesType = this.data.speciesType;


    if (speciesType == "" && specialPoint == "" && detailInfo == "") {
      return;
    }
    wx.showModal({
      title: '提示',
      content: '您即将退出编辑，是否保存已填写内容',
      success: function (res) {
        if (res.confirm) {
          that.keepStorage();
        }
        if (res.cancel) {
          var chooseTab = that.data.chooseTab;
          var emergencyType = '';
          if (chooseTab == 0) {
            emergencyType = '1';
            wx.setStorageSync("recordEmergencyStorageLost", "");
          } else {
            emergencyType = '2';
            wx.setStorageSync("recordEmergencyStorageFind", "");
          }

          that.setData({
            showMenut: true,
            chooseTab: '',
          })
        }
      }
    })
  },
  keepStorage: function () {
    var that = this;
    //页面退出，提示保存
    var chooseTab = this.data.chooseTab;
    var emergencyType = '';
    if (chooseTab == 0) {
      emergencyType = '1';
    } else {
      emergencyType = '2';
    }

    var storage = wx.getStorageSync('droplocation')
    //获取表单数据
    var speciesType = this.data.speciesType;
    var agePickVal = this.data.agePickVal;
    var genderType = this.data.genderType;
    var region = this.data.region;
    var regionArr = region;
    var regionDetail = '';
    if (region != null && region.length > 0) {
      regionDetail = region[0] + ' ' + region[1] + ' ' + region[2];
    }
    var date = this.data.date;
    var sterilizeType = this.data.sterilizeType;
    var immuneType = this.data.immuneType;
    var chipType = this.data.chipType;

    if (speciesType == '1') {
      speciesType = '狗狗'
    } else if (speciesType == '2') {
      speciesType = '猫咪'
    }

    if (genderType == '1') {
      genderType = '未知'
    } else if (genderType == '2') {
      genderType = '男孩'
    } else if (genderType == '3') {
      genderType = '女孩'
    }

    if (sterilizeType == '1') {
      sterilizeType = '已绝育'
    } else if (sterilizeType == '2') {
      sterilizeType = '未绝育'
    } else if (sterilizeType == '3') {
      sterilizeType = '未知'
    }

    if (immuneType == '1') {
      immuneType = '已免疫'
    } else if (immuneType == '2') {
      immuneType = '未免疫'
    } else if (immuneType == '3') {
      immuneType = '未知'
    }


    if (chipType == '1') {
      chipType = '有芯片'
    } else if (chipType == '2') {
      chipType = '无芯片'
    } else if (chipType == '3') {
      chipType = '未知'
    }


    var content = {
      emergencyType: emergencyType,
      petName: petName,
      speciesType: speciesType,
      breed: breed,
      agePickVal: agePickVal,
      genderType: genderType,
      regionArr: regionArr,
      regionDetail: regionDetail,
      wxAccount: wxAccount,
      phone: phone,
      lostDate: date,
      sterilizeType: sterilizeType,
      immuneType: immuneType,
      chipType: chipType,
      specialPoint: specialPoint,
      detailInfo: detailInfo,
      reward: reward
    }


    if (ImageUrls.length > 0 || storage != "" || content != '') {
      if (storage != "") {
        storage.select = true
      }

      var recordStorage = {
        ImageUrls: ImageUrls,
        content: JSON.stringify(content),
        droplocation: storage,
        recordType: 3
      }
      if (emergencyType == '1') {
        wx.setStorageSync("recordEmergencyStorageLost", recordStorage)
      } else {
        wx.setStorageSync("recordEmergencyStorageFind", recordStorage)
      }

      that.setData({
        showMenut: true,
        chooseTab: '',
      })
    }
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

function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}