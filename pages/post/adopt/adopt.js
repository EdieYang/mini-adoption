var util = require('../../../utils/util.js');
var userId;
var petId;
const app = getApp()
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


Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    photoPrefix: app.globalData.staticResourceUrlPrefix,
    disabled:false,
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
    currentDetailWordNumber: 200,
    currentStoryWordNumber: 200,
    immuneType: '',
    sterilizeType: '',
    petCharacter: [{
        name: '讲卫生',
        value: '1',
        checked: false
      },
      {
        name: '亲人',
        value: '2',
        checked: false
      },
      {
        name: '不乱叫',
        value: '3',
        checked: false
      },
      {
        name: '高冷',
        value: '4',
        checked: false
      },
      {
        name: '胆小',
        value: '5',
        checked: false
      },
      {
        name: '健康',
        value: '6',
        checked: false
      },
      {
        name: '无攻击性',
        value: '7',
        checked: false
      },
      {
        name: '会看家',
        value: '8',
        checked: false
      },
      {
        name: '活泼',
        value: '9',
        checked: false
      },
      {
        name: '聪明',
        value: '10',
        checked: false
      }
    ],
    requirements: [{
      name: '领养前取得家人的同意。',
      value: '1',
      checked: false
    }, {
      name: '不离不弃，有病就医，不虐待，不买卖。',
      value: '2',
      checked: false
    }, {
      name: '文明养宠，出门牵绳子，科学喂养。',
      value: '3',
      checked: false
    }, {
      name: '签订领养协议。',
      value: '4',
      checked: false
    }, {
      name: '接受随访。',
      value: '5',
      checked: false
    }, {
      name: '有防盗门，纱窗护网。',
      value: '6',
      checked: false
    }, {
      name: '按时打疫苗。',
      value: '7',
      checked: false
    }, {
      name: '适龄绝育。',
      value: '8',
      checked: false
    }, {
      name: '工作稳定，有一定经济基础。',
      value: '9',
      checked: false
    }, {
      name: '其他(先勾选再填信息)',
      value: '10',
      checked: false
    }],
    obeyRules: false,
    showAddPhotoCover: true,
    petName: '',
    organization: '公益机构',
    organizationId:'',
    inputBorder: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    //判断是否加载缓存
    var that = this
    userId = app.globalData.userId
    loadState = options.loadState
    petId = options.petId
    ImageUrls = []
    //修改
    if (loadState == 1) {
      wx.showLoading({
        title: '正在加载',
      })
      ImageUrls = []
      that.setData({
        ImageUrls: []
      })
      this.getAdoptionDetail()
    }
  },
  getAdoptionDetail: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/pets/' + petId,
      method: "GET",
      data: {
        userId: userId
      },
      success: function(res) {
        var petInfo = res.data.data.petInfo
        var userInfo = res.data.data.userInfo
        var mediaList = petInfo.mediaList
        var petCharacteristic = JSON.parse(petInfo.petCharacteristic)
        petInfo.petCharacteristic = petCharacteristic
        var adoptRequirements = JSON.parse(petInfo.adoptRequirements)
        petInfo.adoptRequirements = adoptRequirements
        for (var i = 0; i < mediaList.length; i++) {
          var tempCover = {
            notDeleted: true,
            data: mediaList[i].mediaPath,
            mediaType: mediaList[i].mediaType,
            mediaId: mediaList[i].mediaId
          };
          ImageUrls.push(tempCover);
        }
        var petCharacter = that.data.petCharacter
        for (var i = 0; i < petCharacteristic.length; i++) {
          petCharacter[petCharacteristic[i].value - 1].checked = true
        }

        var adoptRequire = that.data.requirements
        for (var i = 0; i < adoptRequirements.length; i++) {
          adoptRequire[adoptRequirements[i].value - 1].checked = true
          if (adoptRequirements[i].value == 10) {
            adoptRequire[adoptRequirements[i].value - 1].name = adoptRequirements[i].name
          }
        }

        var regionArr = petInfo.address.split(' ')
        var regionSpllit = ['上海市', regionArr[0], regionArr[1]]
        that.setData({
          petName: petInfo.petName,
          agePickVal: petInfo.petAge,
          speciesType: petInfo.petType,
          genderType: petInfo.petSex,
          sterilizeType: petInfo.petSterilization,
          vaccineType: petInfo.petVaccine,
          parasiteType: petInfo.petParasite,
          fromType: petInfo.petFrom,
          sizeType: petInfo.petSomatotype,
          hairType: petInfo.petHair,
          petCharacter: petCharacter,
          requirements: adoptRequire,
          story: petInfo.story,
          region: regionSpllit,
          hasArea: true,
          wxAccount: petInfo.wxId,
          phone: petInfo.mobilePhone,
          ImageUrls: ImageUrls
        })
        wx.hideLoading()
      }
    })
  },
  chooseSpecies: function(e) {
    var species = e.currentTarget.dataset.type;
    this.setData({
      speciesType: species
    })
  },
  bindAgeRange: function(e) {
    var index = e.detail.value;
    var agePickValArr = this.data.ageRange;
    var agePickVal = agePickValArr[index];
    this.setData({
      agePickVal: agePickVal
    })
  },
  chooseGender: function(e) {
    var gender = e.currentTarget.dataset.type;
    this.setData({
      genderType: gender
    })
  },
  bindRegionChange: function(e) {
    console.log(e.detail.value);
    this.setData({
      region: e.detail.value,
      hasArea: true
    })
    if (this.data.region[0] != '上海市') {
      wx.showToast({
        title: '仅限上海本地送养！',
        icon: 'none',
        duration: 2000
      })
    }
  },
  chooseSterilize: function(e) {
    var sterilize = e.currentTarget.dataset.type;
    this.setData({
      sterilizeType: sterilize
    })
  },
  chooseVaccine: function(e) {
    var vaccineType = e.currentTarget.dataset.type;
    this.setData({
      vaccineType: vaccineType
    })
  },

  chooseParasite: function(e) {
    var parasiteType = e.currentTarget.dataset.type;
    this.setData({
      parasiteType: parasiteType
    })
  },

  chooseChip: function(e) {
    var chip = e.currentTarget.dataset.type;
    this.setData({
      chipType: chip
    })
  },
  chooseFrom: function(e) {
    var that=this
    var fromType = e.currentTarget.dataset.type;
    if (fromType == 2) {
      wx.request({
        url: app.globalData.requestUrlCms + '/adopt/orgs/list',
        method: "GET",
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          var dataList = res.data.data
          var orgList = []
          for (var i = 0; i < dataList.length; i++) {
            orgList.push(dataList[i].orgName)
          }
          wx.showActionSheet({
            itemList: orgList,
            success(res) {
              that.setData({
                organization: orgList[res.tapIndex],
                organizationId: dataList[res.tapIndex].orgId
              })
            },
            fail(res) {
              console.log(res.errMsg)
              that.setData({
                organization:'公益机构',
                organizationId: '',
              })
            }
          })
        }
      })
    }
    this.setData({
      fromType: fromType
    })
  },
  chooseSize: function(e) {
    var sizeType = e.currentTarget.dataset.type;
    this.setData({
      sizeType: sizeType
    })
  },
  chooseHair: function(e) {
    var hairType = e.currentTarget.dataset.type;
    this.setData({
      hairType: hairType
    })
  },
  chooseCharacter: function(e) {
    var index = e.currentTarget.dataset.type;
    var petCharacters = this.data.petCharacter
    var checked = petCharacters[index].checked
    var checkedNos = 0
    var checkedIndex = 0
    for (var i = 0; i < petCharacters.length; i++) {
      if (petCharacters[i].checked) {
        checkedNos++
        if (i == index) {
          checkedIndex++
        }
      }
    }
    if (checkedNos == 3 && checkedIndex == 0) {
      return;
    }
    if (checked) {
      petCharacters[index].checked = false
    } else {
      petCharacters[index].checked = true
    }
    this.setData({
      petCharacter: petCharacters
    })
  },
  chooseRequirement: function(e) {
    var index = e.currentTarget.dataset.type;
    var requirements = this.data.requirements
    var checked = requirements[index].checked
    if (checked) {
      requirements[index].checked = false
    } else {
      requirements[index].checked = true
    }
    this.setData({
      requirements: requirements
    })
  },
  obeyRules: function() {
    var obey = this.data.obeyRules
    this.setData({
      obeyRules: !obey
    })
  },
  adoptRules: function() {
    wx.navigateTo({
      url: '../../adoption/rule/rule',
    })
  },
  bindDateChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  addPhoto: function() {
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
      success: function(res) {
        for (var i = 0; i < res.tempFiles.length; i++) {
          var fileSize = res.tempFiles[i].size
          if (fileSize > 1024 * 1024 * 5) {
            wx.showToast({
              title: '照片大小超出5M限制，请重新选择',
              icon: 'none',
              duration: 2000
            })
            return
          }
        }

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
        'ossZone': 'adopt'
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
        var mediaType = picUrl.substring(picUrl.indexOf('.') + 1)
        //添加数组中去
        var tempCover = {
          notDeleted: true,
          data: picUrl,
          mediaType: mediaType,
          mediaId: ''
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
  delImg: function(event) {
    var index = event.currentTarget.dataset.index;
    ImageUrls[index].notDeleted = false;
    showAddPhotoCover = true;
    this.setData({
      ImageUrls: ImageUrls,
      showAddPhotoCover: showAddPhotoCover
    })

  },
  toMapLocate: function() {
    showLocationHistory = true
    wx.navigateTo({
      url: '../maplocate/maplocate',
    })
  },
  verifyPhone: function(event) {
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
  requirementOtherInput: function(event) {
    // 获取输入框的内容
    var value = event.detail.value;
    // 获取输入框内容的长度
    var len = parseInt(value.length);


    //最多字数限制
    if (len > 200) {
      value = value.substring(0, 200);
      this.setData({
        requirementOther: value,
        currentDetailWordNumber: 200 - value.length
      })
      return;
    }
    // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
    this.setData({
      requirementOther: value,
      currentDetailWordNumber: 200 - len //当前字数
    });
  },
  storyInput: function(event) {
    // 获取输入框的内容
    var value = event.detail.value;
    // 获取输入框内容的长度
    var len = parseInt(value.length);


    //最多字数限制
    if (len > 200) {
      value = value.substring(0, 200);
      this.setData({
        story: value,
        currentStoryWordNumber: 200 - value.length
      })
      return;
    }
    // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
    this.setData({
      story: value,
      currentStoryWordNumber: 200 - len //当前字数
    });
  },
  submitNew: function(e) {
    var that = this
    this.setData({
      disabled:true
    })
    wx.showLoading({
      title: '正在发布',
      mask:true
    })
    var formId = e.detail.formId

    var imageArr = [];
    var imageLength = 0
    if (loadState == 1) {
      for (var i = 0; i < ImageUrls.length; i++) {
        var item = {}
        item.mediaPath = ImageUrls[i].data
        item.mediaId = ImageUrls[i].mediaId
        item.mediaType = ImageUrls[i].mediaType
        if (ImageUrls[i].notDeleted) {
          item.isValid = 1
          imageLength++;
        } else if (item.mediaId != '' && typeof item.mediaId != 'undefined') {
          item.isValid = 0
        }
        imageArr.push(item)
      }
    } else {
      for (var i = 0; i < ImageUrls.length; i++) {
        if (ImageUrls[i].notDeleted) {
          imageLength++;
          var item = {}
          item.mediaPath = ImageUrls[i].data
          item.mediaId = ImageUrls[i].mediaId
          item.mediaType = ImageUrls[i].mediaType
          imageArr.push(item)
        }
      }
    }

    if (imageLength == 0) {
      wx.showToast({
        title: '须上传宠物照片',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    }

    //获取表单数据
    var petName = e.detail.value.petName;
    if (this.checkEmptyVar(petName)) {
      wx.showToast({
        title: '须填写宠物名字',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
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
      that.setData({
        disabled: false
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
      that.setData({
        disabled: false
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
      that.setData({
        disabled: false
      })
      return;
    }


    var sterilizeType = this.data.sterilizeType;
    if (this.checkEmptyVar(sterilizeType)) {
      wx.showToast({
        title: '须选择是否绝育',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    }



    var vaccineType = this.data.vaccineType;
    if (this.checkEmptyVar(vaccineType)) {
      wx.showToast({
        title: '须选择疫苗接种情况',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    }

    var parasiteType = this.data.parasiteType;
    if (this.checkEmptyVar(parasiteType)) {
      wx.showToast({
        title: '须选择驱虫情况',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    }

    var fromType = this.data.fromType;
    if (this.checkEmptyVar(fromType)) {
      wx.showToast({
        title: '须选择宠物来源',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    }


    var sizeType = this.data.sizeType;
    if (this.checkEmptyVar(sizeType)) {
      wx.showToast({
        title: '须选择宠物体型',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    }

    var hairType = this.data.hairType;
    if (this.checkEmptyVar(hairType)) {
      wx.showToast({
        title: '须选择宠物毛发',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    }



    var characterList = this.data.petCharacter
    var characterReq = []
    for (var i = 0; i < characterList.length; i++) {
      if (characterList[i].checked) {
        var item = {}
        item.name = characterList[i].name
        item.value = characterList[i].value
        characterReq.push(item)
      }
    }

    var requirementList = this.data.requirements
    var requirementReq = []
    for (var i = 0; i < requirementList.length; i++) {
      if (requirementList[i].checked) {
        var item = {}
        if (requirementList[i].value == 10) {
          var requireOther = this.data.requirementOther
          if (this.checkEmptyVar(requireOther) && loadState !=1) {
            wx.showToast({
              title: '须填写领养其他要求',
              icon: 'none',
              duration: 2000
            })
            that.setData({
              inputBorder:true,
              disabled:false
            })

            return;
          }
          item.name = this.data.requirementOther
        } else {
          item.name = requirementList[i].name
        }
        item.value = requirementList[i].value
        requirementReq.push(item)
      }
    }


    if (requirementReq.length == 0) {
      wx.showToast({
        title: '须选择领养要求',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    }

    var story = this.data.story;
    if (this.checkEmptyVar(story) || util.trimString(story) == '') {
      wx.showToast({
        title: '须填写宠物送养故事',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    }

    var region = this.data.region;
    if (this.checkEmptyVar(region)) {
      wx.showToast({
        title: '须选择所在地',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    } else if (region[0] != '上海市') {
      wx.showToast({
        title: '仅限上海本地送养！',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    }

    var regionArr = region

    var regionDetail = region[1] + ' ' + region[2]

    var wxAccount = e.detail.value.wxAccount;


    var phone = e.detail.value.phone;
    if (this.checkEmptyVar(phone)) {
      wx.showToast({
        title: '须填写手机号',
        icon: 'none',
        duration: 2000
      })
      that.setData({
        disabled: false
      })
      return;
    }

    if (!(/^1(3|4|5|7|8)\d{9}$/.test(phone))) {
      wx.showToast({
        title: '请输入正确的手机号',
        duration: 1000,
        icon: 'none'
      })
      that.setData({
        disabled: false
      })
      return;
    }

    if (!this.data.obeyRules) {
      wx.showToast({
        title: '须同意邻宠领养平台送养规则',
        duration: 3000,
        icon: 'none'
      })
      that.setData({
        disabled: false
      })
      return;
    }


    if (loadState == 1) {
      var dataReq = {
        petId: petId,
        petName: petName,
        petAge: agePickVal,
        petType: speciesType,
        petSex: genderType,
        petSterilization: sterilizeType,
        petVaccine: vaccineType,
        petParasite: parasiteType,
        petFrom: fromType,
        petSomatotype: sizeType,
        petHair: hairType,
        petCharacteristic: JSON.stringify(characterReq),
        adoptRequirements: JSON.stringify(requirementReq),
        address: regionDetail,
        wxId: wxAccount,
        mobilePhone: phone,
        story: story,
        createBy: userId,
        adoptStatus: '0',
        mediaList: imageArr,
        orgId: that.data.organizationId,
        formId: formId
      }
      wx.request({
        url: app.globalData.requestUrlCms + '/adopt/pets/info',
        data: dataReq,
        method: "PUT",
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          var petId = res.data.data
          wx.hideLoading();
          wx.showToast({
            title: '修改成功',
            icon: 'none',
            mask: true,
            duration: 2000
          })
          imageArr = []
          ImageUrls = []
          that.setData({
            ImageUrls: []
          })
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        }
      })
    } else {
      var dataReq = {
        petName: petName,
        petAge: agePickVal,
        petType: speciesType,
        petSex: genderType,
        petSterilization: sterilizeType,
        petVaccine: vaccineType,
        petParasite: parasiteType,
        petFrom: fromType,
        petSomatotype: sizeType,
        petHair: hairType,
        petCharacteristic: JSON.stringify(characterReq),
        adoptRequirements: JSON.stringify(requirementReq),
        address: regionDetail,
        wxId: wxAccount,
        mobilePhone: phone,
        story: story,
        createBy: userId,
        mediaList: imageArr,
        orgId: that.data.organizationId,
        formId: formId
      }
      wx.request({
        url: app.globalData.requestUrlCms + '/adopt/pets/info',
        data: dataReq,
        method: "POST",
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          var petId = res.data.data
          imageArr = []
          ImageUrls = []
          that.setData({
            ImageUrls: []
          })
          wx.hideLoading();
          wx.showToast({
            title: '发布成功',
            icon: 'none',
            duration: 2000,
            mask: true
          })
          setTimeout(function() {
            wx.redirectTo({
              url: '../../adoption/detail/detail?petId=' + petId,
            })
          }, 2000)
        }
      })
    }
  },

  checkEmptyVar: function(param) {
    if (!param || typeof(param) == 'undefined' || param == "") {
      return true;
    } else {
      return false;
    }
  },

  nameInput: function(event) {
    petName = event.detail.value;
  },
  breedInput: function(event) {
    breed = event.detail.value;
  },
  wxAccountInput: function(event) {
    wxAccount = event.detail.value;
  },
  phoneInput: function(event) {
    phone = event.detail.value;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {

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
  onShareAppMessage: function() {

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