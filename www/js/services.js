fook = angular.module('app.services', []);

fook.factory('$localStorage', ['$window',appLocalStorage]);
fook.factory('Auth', ['$q', '$localStorage',Auth]);
fook.factory('UserData', ['$http','ApiEndpoint',UserData]);

function appLocalStorage($window){

      return {
        set: function(key, value) {
          $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
          return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
          $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
          return JSON.parse($window.localStorage[key] || '{}');
        }
      }

}

function Auth($q, $localStorage) {

       var user = $localStorage.getObject('prt.user');
       var brand = $localStorage.getObject('prt.brand');
       var brandData = [], userData = [];

       var setUser = function (user) {
          userData = user;
          $localStorage.setObject('prt.user', user);
       }

       var setbrand = function (brand) {
          brandData = brand;
          $localStorage.setObject('prt.brand', brand);
       }

       return {
          setUser: setUser,
          setBrand: setbrand,
          isUserLogin : function(){

            if(!$localStorage.getObject('prt.user').id_pengelola) return false; 
            userData = $localStorage.getObject('prt.user');

            return true;
            
          },
          isBrandLogin : function(){

            if(!$localStorage.getObject('prt.brand').id_usaha) return false; 
            brandData = $localStorage.getObject('prt.brand');

            return true;
            
          },
          getUserData : function(){
            
            return userData;

          },
          getBrandData : function(){
            
            return brandData;

          },
          getUser: function () {

             return $localStorage.getObject('prt.user');

          },
          getBrand: function () {

             return $localStorage.getObject('prt.brand');

          },
          logout: function () {
            
             window.localStorage.removeItem('prt.user');  
             window.localStorage.removeItem('prt.brand');  

             user = null;
             brand = null;
             
          }
    }
}

function UserData($http, ApiEndpoint) {

  var data = [];
  var status = [];
  var usaha = [];
  var tmp =[];
  var items = [];

  return {
    setData : function(val){
        
          data = val;

    },
    getData : function(){

          return data;

    },
    setDataItems : function(val){
        
          items = val;

    },
    getDataItems : function(){

          return items;

    },
    setDataTmp : function(val){
          
      if(val.waktu_itemtravel) val.waktu_itemtravel = new Date(val.waktu_itemtravel);
      
      tmp = val;

    },
    getDataTmp : function(){

          return tmp;

    },
    setDataStatus : function(val){
        
          status = val;

    },
    getDataStatus : function(){

          return status;

    },
    
    setDataStatusSingle : function(input){

    	status.push(input);
    	
    },
    setDataUsaha : function(val){
        
          usaha = val;

    },
    getDataUsaha : function(){

          return usaha;

    },
    
    setDataUsahaSingle : function(input){
    	var check = false;
    	for(var i=0; i < usaha.length;i++){
    		if(usaha[i].id_usaha == input.id_usaha) check = true;
    	}
    	if(!check){
    		usaha.push(input);
    	}
    },

    getFeed : function(type) {

        return $http.get(ApiEndpoint.url + 'search/feed/'+type);

    },

    getUsahaSearch : function(type) {

        return $http.get(ApiEndpoint.url + 'search/usaha/'+type);

    },

    getInfoItem : function(type,page) {

        switch(type){
          case 'travel' :
            return $http.get(ApiEndpoint.url + 'search/travel?page='+page);
          break;
          case 'rental' :
            return $http.get(ApiEndpoint.url + 'search/rental?page='+page);
          break;
        }

        return $http.get(ApiEndpoint.url + 'search/travel');

    },

    getInfo : function(data) {

        return $http.get(ApiEndpoint.url + 'usaha/feed/'+data.id_usaha);

    },

    storeInfo : function(user,data) {

        return $http.post(ApiEndpoint.url + 'usaha/feed/'+user.id_usaha, data);

    },

    deleteInfo : function(user,data) {

        return $http.post(ApiEndpoint.url + 'usaha/feed/'+user.id_usaha+'/delete/'+data.id_info, data);

    },
    getItem : function(type,data) {

        switch(type){
          case 'travel' :
            return $http.get(ApiEndpoint.url + 'usaha/item/'+data.id_usaha+'/travel');
          break;
          case 'rental' :
            return $http.get(ApiEndpoint.url + 'usaha/item/'+data.id_usaha+'/rental');
          break;
        }

        return $http.get(ApiEndpoint.url + 'usaha/item/'+data.id_usaha+'/travel');

    },

    storeItem : function(type,user,data) {

        switch(type){
          case 'travel' :
            return $http.post(ApiEndpoint.url + 'usaha/item/'+user.id_usaha+'/travel',data);
          break;
          case 'rental' :
            return $http.post(ApiEndpoint.url + 'usaha/item/'+user.id_usaha+'/rental',data);
          break;
        }

        return $http.post(ApiEndpoint.url + 'usaha/item/'+data.id_usaha+'/travel',data);

    },

    updateItem : function(type,user,data) {

        switch(type){
          case 'travel' :
            return $http.post(ApiEndpoint.url + 'usaha/item/'+data.id_itemtravel+'/update/'+user.id_usaha+'/travel',data);
          break;
          case 'rental' :
            return $http.post(ApiEndpoint.url + 'usaha/item/'+data.id_itemrental+'/update/'+user.id_usaha+'/rental',data);
          break;
        }

        return $http.post(ApiEndpoint.url + 'usaha/item/'+data.id_itemtravel+'/update/'+user.id_usaha+'/travel',data);

    },

   deleteItem : function(type,user,data) {

        switch(type){
          case 'travel' :
            return $http.post(ApiEndpoint.url + 'usaha/item/'+data.id_itemtravel+'/delete/'+user.id_usaha+'/travel');
          break;
          case 'rental' :
            return $http.post(ApiEndpoint.url + 'usaha/item/'+data.id_itemrental+'/delete/'+user.id_usaha+'/rental');
          break;
        }

        return $http.post(ApiEndpoint.url + 'usaha/item/'+data.id_itemtravel+'/delete/'+user.id_usaha+'/travel');

    },

    getUsaha : function(data) {

        return $http.get(ApiEndpoint.url + 'usaha/get/'+data.id_pengelola);

    },
    
    getLocation : function(data) {

          return $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + data);

    },

    getUsahaAll : function(data) {

        return $http.get(ApiEndpoint.url + 'search/usaha');

    },

    storeUsaha : function(user,data) {

        return $http.post(ApiEndpoint.url + 'usaha/store/'+user.id_pengelola, data);

    },

    updateUsaha : function(user,data) {

        return $http.post(ApiEndpoint.url + 'usaha/update/'+data.id_usaha+'/by/'+user.id_pengelola, data);

    },

    deleteUsaha : function(user,data) {

        return $http.post(ApiEndpoint.url + 'usaha/delete/'+data.id_usaha+'/by/'+user.id_pengelola, data);

    },

    loginUser : function(data) {

        return $http.post(ApiEndpoint.urlAuth + 'login/user', data);

    },

    registerUser : function(data) {

        return $http.post(ApiEndpoint.urlAuth + 'register/user', data);

    }
  }
}