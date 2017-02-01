angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('login', {
        url: '/login',
        templateUrl: 'templates/updated/login.html',
        controller: 'loginCtrl',
        onEnter : function(Auth,$state){
          if(Auth.isUserLogin()){
            $state.go('app.dashboard');
          }
        }
    })

    .state('register', {
        url: '/register',
        templateUrl: 'templates/updated/register.html',
        controller: 'registerCtrl',
        onEnter : function(Auth,$state){
          if(Auth.isUserLogin()){
            $state.go('app.dashboard');
          }
        }
    })

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/updated/menu.html',
        controller : 'MainCtrl'
    })

    .state('app.dashboard', {
      url: '/dashboard',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/dashboard.html',
              controller: 'homePageCtrl'
          }
      }
    })

    .state('app.user-usaha', {
      url: '/user-usaha',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/user-usaha.html',
              controller: 'usahaCtrl'
          }
      }
    })

    .state('app.user-usaha-new', {
      url: '/user-usaha-new',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/user-usaha-new.html',
              controller: 'usahaCtrl'
          }
      }
    })

    .state('app.user-usaha-dashboard', {
      url: '/user-usaha-dashboard',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/user-usaha-dashboard.html',
              controller: 'usahaCtrl'
          }
      },
      onEnter : function(Auth,$state){
        if(!Auth.isBrandLogin()){
          $state.go('app.user-usaha');
        }
      }
    })

    .state('app.user-feed', {
      url: '/user-feed',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/user-status.html',
              controller: 'feedCtrl'
          }
      },
      onEnter : function(Auth,$state){
        if(!Auth.isBrandLogin()){
          $state.go('app.user-usaha');
        }
      }
    })

    .state('app.tambahinfo-usaha', {
      url: '/tambahitem-rental/:type',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/tambahInfoUsaha.html',
              controller: 'feedCtrl'
          }
      }
    })

    .state('app.itemInfo', {
      url: '/itemInfo',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/itemInfo.html',
              controller: 'feedCtrl'
          }
      }
    })


    .state('app.tambahitem-rental', {
      url: '/tambahitem-rental/:type',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/tambahItemRental.html',
              controller: 'itemCtrl'
          }
      }
    })

     .state('app.tambahitem-travel', {
      url: '/tambahitem-travel/:type',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/tambahItemTravel.html',
              controller: 'itemCtrl'
          }
      }
    })

      .state('app.list-travel', {
      url: '/list-travel/:type',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/listTravel.html',
              controller: 'itemCtrl'
          }
      }
    })

       .state('app.list-rental', {
      url: '/list-rental/:type',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/listRental.html',
              controller: 'itemCtrl'
          }
      }
    })

    .state('app.edit-itemrental', {
      url: '/edit-itemRental/:type',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/editItemRental.html',
              controller: 'itemCtrl'
          }
      },
      onEnter: function(UserData,$state){
        if(!UserData.getDataTmp().id_itemrental){
          $state.go('app.list-rental',{ type : 'rental' });
        }
      }
    })

    .state('app.edit-itemtravel', {
      url: '/edit-itemTravel/:type',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/editItemTravel.html',
              controller: 'itemCtrl'
          }
      },
      onEnter: function(UserData,$state){
        if(!UserData.getDataTmp().id_itemtravel){
          $state.go('app.list-travel',{ type : 'travel' });
        }
      }
    })

     .state('app.edit-infousaha', {
      url: '/edit-infousaha',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/editInfoUsaha.html'
          }
      }
    })

    .state('app.edit-usaha', {
      url: '/edit-usaha',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/editUsaha.html',
              controller: 'usahaCtrl'
          }
      },
      onEnter: function(UserData,$state){
        if(!UserData.getDataTmp().nama_usaha){
          $state.go('app.user-usaha');
        }
      }
    })

    .state('app.itemtravel', {
      url: '/itemtravel',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/itemTravel.html'
          }
      }
    })

    .state('app.itemrental', {
      url: '/itemrental',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/itemRental.html'
          }
      }
    })

      .state('app.lihatInfo', {
      url: '/lihatInfo',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/lihatInfo.html',
              controller : 'infoUmumCtrl'
          }
      }
    })

    .state('app.umum-lihatdaftar', {
      url: '/lihatdaftar',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/lihatDaftar.html',
              controller : 'infoUmumCtrl'
          }
      }
    })

    .state('app.umum-lihatsekitar', {
      url: '/lihatsekitar',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/lihatSekitar.html',
              controller: 'LihatSekitarCtrl'
          }
      }
    })

    .state('app.umum-detailInfo', {
      url: '/detailinfo',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/detailInfo.html'
          }
      }
    })

    .state('app.umum-detilusaha', {
      url: '/detilusaha',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/detilUsaha.html',
              controller: 'usahaCtrl'
          }
      },
      onEnter: function(UserData,$state){
        if(!UserData.getDataTmp().nama_usaha){
          $state.go('app.umum-lihatsekitar');
        }
      }
    })

    .state('app.umum-listtravel', {
      url: '/listTravel',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/umum-listTravel.html',
              controller: 'itemUmumCtrl'
          }
      },
      onEnter: function(UserData,$state){
        if(!UserData.getDataTmp().nama_usaha){
          $state.go('app.umum-lihatsekitar');
        }
      }
    })

    .state('app.umum-carilokasi', {
      url: '/carilokasi',
      cache : true,
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/cariLokasi.html',
              controller: 'itemCariLokasiCtrl'
          }
      },
      onEnter: function(UserData,$state){
        if(!UserData.getDataTmp().nama_usaha){
          $state.go('app.umum-lihatsekitar');
        }
      }
    })

    .state('app.umum-listrental', {
      url: '/listrental',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/umum-listrental.html',
              controller: 'itemUmumCtrl'
          }
      },
      onEnter: function(UserData,$state){
        if(!UserData.getDataTmp().nama_usaha){
          $state.go('app.umum-lihatsekitar');
        }
      }
    })

    .state('app.umum-listinfo', {
      url: '/listinfo',
      views: {
          'menuContent': {
              templateUrl: 'templates/updated/umum-listinfo.html',
              controller: 'itemUmumCtrl'
          }
      },
      onEnter: function(UserData,$state){
        if(!UserData.getDataTmp().nama_usaha){
          $state.go('app.umum-lihatsekitar');
        }
      }
    })

    .state('app.umum-detaillisttravel', {
          url: '/detail-Listtravel',
          views: {
              'menuContent': {
                  templateUrl: 'templates/updated/umum-detilItemTravel.html',
                controller: 'itemCtrl'
              }
          }
        })

        .state('app.umum-detaillistrental', {
          url: '/detail-listrental',
          views: {
              'menuContent': {
                  templateUrl: 'templates/updated/umum-detilItemRental.html',
                  controller: 'itemCtrl'
              }
          }
        })

/*        .state('app.umum-detaillistinfo', {
          url: '/detail-listinfo',
          views: {
              'menuContent': {
                  templateUrl: 'templates/updated/umum-detilItemInfo.html'
              }
          }
        })*/

    ;

    $urlRouterProvider.otherwise('/app/lihatInfo');

});