angular.module('app.controllers', ['ionic'])
  
.controller('homePageCtrl', ['$scope', '$stateParams', 'UserData', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, UserData) {
	$scope.feeds = [];

	UserData.getFeed().success(function(data){
		console.log(data);
	}).error(function(data){

	}).finally(function(data){

	});

}])

.controller('LihatSekitarCtrl', ['$timeout', '$filter','$scope', '$stateParams', 'UserData', 'Auth', '$state', '$ionicPopup','$ionicHistory',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($timeout, $filter, $scope, $stateParams, UserData, Auth, $state,$ionicPopup,$ionicHistory) {
	
	$scope.auth = Auth;
	$scope.items = [];
	$scope.type = 'travel';

	$scope.changeInfo = function(type){
		$scope.type = type;
		UserData.getUsahaSearch(type).success(function(data){
			$scope.items = data.data;
		}).error(function(){

		}).finally(function(){

		});

	};

	$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 13, radius : 0};
	
	$scope.circle = { 
		center: { latitude: 45, longitude: -73 }, radius : 10000, fill: { color: '#08B21F', opacity: 0.3 }, editable : true
	};

	$scope.getDistance = function(latitude, longitude) {

		var a = new google.maps.LatLng(Number(latitude), Number(longitude));
		var b = new google.maps.LatLng($scope.map.center.latitude, $scope.map.center.longitude);

		var d = google.maps.geometry.spherical.computeDistanceBetween(a, b);

		return d;
	};

	$scope.toKm = function(data){
		
		return parseFloat(data/1000).toFixed(1);

	}

	$scope.getCurrentLocation = function(){

		var options = {
		                enableHighAccuracy: true
		            };

		navigator.geolocation.getCurrentPosition(function(pos) {
		                $scope.map = { center: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }, zoom: 10, radius : 0 };

		                $scope.circle.center.latitude = pos.coords.latitude;
		                $scope.circle.center.longitude = pos.coords.longitude;

		            }, 
		            function(error) {                    
		                alert('Unable to get location: ' + error.message);
		            }, options);

	}

	$scope.greaterThan = function(prop, val){
	    return function(item){
	      return item[prop] < val;
	    }
	}

	$scope.detilusaha = function(data){
		UserData.setDataTmp(data);
		$state.go('app.umum-detilusaha');
	}

	$scope.moveCircle = function(data){

		$scope.circle.radius = Number(data);

	}

	$timeout(function(){
		 $scope.getCurrentLocation();
	},200);

	UserData.getUsahaAll($scope.type).success(function(data){
		for(var i =0; i < data.data.length;i++){
			var c = data.data[i];
			c.distance_usaha = $scope.getDistance(c.latitude_usaha,c.longitude_usaha);
			c.coords = { latitude : c.latitude_usaha, longitude : c.longitude_usaha}
			$scope.items.push(c);
		}
	});

}])

.controller('MainCtrl', ['$scope', '$stateParams', 'UserData', 'Auth', '$state', '$ionicPopup','$ionicHistory',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, UserData, Auth, $state,$ionicPopup,$ionicHistory) {
	
	$scope.auth = Auth;
	$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

	$scope.logout = function() {
		var confirmPopup = $ionicPopup.confirm({
		 title: 'Logout',
		 template: 'Apa anda yakin keluar?'
		});

		confirmPopup.then(function(res) {
		 if(res) {
			Auth.logout();
			$ionicHistory.nextViewOptions({disableBack:true});
			$state.go('app.lihatInfo');
		 }
		});
	};
	$scope.$watch(function(){ return Auth.getUserData(); }, function(newValue, oldValue, scope) {
		
		$scope.auth = Auth;

	}, true);
}])

.controller('usahaCtrl', ['ApiEndpoint', '$ionicScrollDelegate','$ionicPlatform','$scope', '$stateParams', 'UserData', 'Auth', '$state', '$ionicHistory', '$ionicPopup', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', '$cordovaDevice', '$ionicActionSheet',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function (ApiEndpoint, $ionicScrollDelegate, $ionicPlatform,$scope, $stateParams, UserData, Auth, $state, $ionicHistory, $ionicPopup, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaDevice, $ionicActionSheet) {
	
	$scope.usahaStatus = { text : 'Submit', status : false};
	$scope.usahaEditStatus = { text : 'Submit', status : false};
	$scope.dataUsaha = { isi_info : '', kategori_usaha : 'travel', latitude_usaha : 1, longitude_usaha : 1 };
	$scope.dataEditUsaha = UserData.getDataTmp();
	$scope.usahas = [];
	$scope.ApiEndpoint = ApiEndpoint;
	$scope.brand = Auth.getBrandData();
	$ionicScrollDelegate.resize();

	Auth.isBrandLogin();

	$scope.getLocation = function(){

		var options = {
		                enableHighAccuracy: true
		            };

		navigator.geolocation.getCurrentPosition(function(pos) {

		                $scope.dataUsaha.latitude_usaha = pos.coords.latitude;
		                $scope.dataUsaha.longitude_usaha = pos.coords.longitude;
		                if($scope.dataEditUsaha.latitude_usaha) $scope.dataEditUsaha.latitude_usaha = pos.coords.latitude;
		                if($scope.dataEditUsaha.longitude_usaha) $scope.dataEditUsaha.longitude_usaha = pos.coords.longitude;

		            }, 
		            function(error) {                    
		                alert('Unable to get location: ' + error.message);
		            }, options);

	}



	$scope.storeUsaha = function(valid,input){

		$scope.usahaStatus.text = 'Submitting';
		$scope.usahaStatus.status = true;

		if(!input.latitude_usaha || !input.longitude_usaha){

			UserData.getLocation(input.alamat_usaha).success(function(data){
				if(data.results.length){

		            input.latitude_usaha = data.results[0].geometry.location.lat;
		            input.longitude_usaha = data.results[0].geometry.location.lng;

				}
			}).error(function(data){
				console.log(data);
			});

		}

		UserData.storeUsaha(Auth.getUserData(),input).success(function(data){
			if(data.status){
				
				$ionicHistory.nextViewOptions({disableBack:true});
				$state.go('app.user-usaha');
				UserData.setDataUsahaSingle(data.data);
			}
		}).error(function(){

		}).finally(function(){
			$scope.usahaStatus = { text : 'Submit', status : false};
		});

	}

	 $scope.deleteUsaha = function(data) {
	   var confirmPopup = $ionicPopup.confirm({
	     title: 'Menghapus '+data.nama_usaha,
	     template: 'Apa anda yaking akan menghapus '+data.nama_usaha+'?'
	   });

	   confirmPopup.then(function(res) {
	     if(res) {
			UserData.deleteUsaha(Auth.getUserData(),data).success(function(data){
				if(data.status){

					UserData.getUsaha(Auth.getUserData()).success(function(data){
						UserData.setDataUsaha(data.data);
					});
					
				}
			}).error(function(){

			}).finally(function(){
				$scope.usahaEditStatus = { text : 'Submit', status : false};
			});
	     }
	   });
	 };

	$scope.updateUsaha = function(valid,data){

		$scope.usahaEditStatus.text = 'Submitting';
		$scope.usahaEditStatus.status = true;
		UserData.updateUsaha(Auth.getUserData(),data).success(function(data){
			if(data.status){
				
				$ionicHistory.nextViewOptions({disableBack:true});
				$state.go('app.user-usaha');
				//UserData.updateDataUsahaSingle(data.data);
			}
		}).error(function(){

		}).finally(function(){
			$scope.usahaEditStatus = { text : 'Submit', status : false};
		});

	}

	$scope.editUsaha = function(data){
		$state.go('app.edit-usaha');
		UserData.setDataTmp(data);
	}

	$scope.loginBrand = function(data){
		$scope.edit = false;
		Auth.setBrand(data);
		$state.go('app.user-usaha-dashboard');

	}

	$scope.$watch(function(){ return UserData.getDataUsaha(); }, function(newValue, oldValue, scope) {
		$scope.usahas = newValue;
		$ionicScrollDelegate.resize();
	},true);

	$scope.$watch(function(){ return Auth.getUserData(); }, function(newValue, oldValue, scope) {
		if(newValue.id_pengelola){
			UserData.getUsaha(Auth.getUserData()).success(function(data){
				UserData.setDataUsaha(data.data);
			});
		}
		$ionicScrollDelegate.resize();
	}, true);	

	$scope.$watch(function(){ return Auth.getBrandData(); }, function(newValue, oldValue, scope) {
		$scope.brand = newValue;
	}, true);

	$scope.image = null;
	$scope.showAlert = function(title, msg) {
	    var alertPopup = $ionicPopup.alert({
	      title: title,
	      template: msg
	    });
	};

	var Camera = navigator.camera;
	$scope.loadImage = function() {

		$ionicPlatform.ready(function(){

		  var options = {
		    titleText: 'Select Image Source',
		     buttons: [
		       { text: 'Load from Library' },
		       { text: 'Use Camera' }
		     ],
		     titleText: 'Modify your album',
		     cancelText: 'Cancel',
		     cancel: function() {
		          return true;
		        },
		    buttonClicked : function(btnIndex){
			    var type = null;
			    if (btnIndex === 0) {
			      type = Camera.PictureSourceType.PHOTOLIBRARY;
			    } else if (btnIndex === 1) {
			      type = Camera.PictureSourceType.CAMERA;
			    }

			    if (type !== null) {
			      $scope.selectPicture(type);
			    }

			    return true;
		    }
		  };

		  $ionicActionSheet.show(options);  

		});

	};

	$scope.selectPicture = function(sourceType) {

		$ionicPlatform.ready(function(){

		  var options = {
		    quality: 100,
		    destinationType: Camera.DestinationType.FILE_URI,
		    sourceType: sourceType,
		    saveToPhotoAlbum: false
		  };
		 
		  $cordovaCamera.getPicture(options).then(function(imagePath) {

		    // Grab the file name of the photo in the temporary directory
		    var currentName = imagePath.replace(/^.*[\\\/]/, '');
		 
		    //Create a new name for the photo
		    var d = new Date(),
		    n = d.getTime(),
		    newFileName =  n + ".jpg";
		 
		    // If you are trying to load image from the gallery on Android we need special treatment!
		    if ($cordovaDevice.getPlatform() == 'Android' && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
		    
			    document.addEventListener('deviceready', function () {

					window.FilePath.resolveNativePath(imagePath, function(entry) {
						window.resolveLocalFileSystemURL(entry, success, fail);

						function fail(e) {
						  console.error('Error: ', e);
						}

						function success(fileEntry) {

						  var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
						  // Only copy because of access rights
						  $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName).then(function(success){
						    
						    $scope.image = newFileName;

						  }, function(error){
						  	console.log(error);
						    $scope.showAlert('Error', error.exception);						    

						  });

						};
						}
					);

			    });

		    } else {

		      var namePath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
		      // Move the file to permanent storage
		      document.addEventListener('deviceready', function () {

			      $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(function(success){

			        $scope.image = newFileName;

			      }, function(error){
			      	console.log(error);
			        $scope.showAlert('Error', error.exception);
			      });

		      });


		    }
		  },
		  function(err){
		    // Not always an error, maybe cancel was pressed...
		    console.log(err);

		  })

		});

	};


	$scope.pathForImage = function(image) {

		var url = '';

		url = cordova.file.dataDirectory + image;

		return url;
	};

	$scope.usahaEditPhoto = { status : false, text : 'Upload' };
	$scope.uploadImage = function() {

		$ionicPlatform.ready(function(){
		  // File for Upload
		  var targetPath = $scope.pathForImage($scope.image);
		 
		  // File name only
		  var filename = $scope.image;
		  var url = ApiEndpoint.url+'usaha/photo/'+$scope.dataEditUsaha.id_usaha+'/by/'+Auth.getUserData().id_pengelola;

		  var options = {

		    fileKey: "photo",
		    fileName: filename,
		    chunkedMode: false,
            mimeType: "image/jpg"

		  };

		  $scope.usahaEditPhoto = { status : true, text : 'Uploading' };
			var ft = new FileTransfer();

			 ft.upload(targetPath, url, function(result){
			 	
			 	var data = JSON.parse(result.response);

			  	if(data.status){

			  		Auth.setBrand(data.data);
			  		$scope.image = null;
			  		$scope.dataEditUsaha = data.data;

			  	}

			    $scope.showAlert('Success', 'Image upload finished.');

			    $scope.usahaEditPhoto = { status : false, text : 'Upload' };

			 }, function(error){

			 	console.log(JSON.stringify(error));
			 	$scope.usahaEditPhoto = { status : false, text : 'Upload' };

			 }, options);

		});

	}

	$scope.$watch('image', function(newValue, oldValue, scope) {
		$scope.image = newValue;
	}, true);

}])
.controller('itemUmumCtrl', ['ApiEndpoint', '$ionicModal','$ionicPlatform', '$scope', '$stateParams', 'UserData', 'Auth', '$state', '$ionicHistory', '$ionicPopup',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function (ApiEndpoint, $ionicModal, $ionicPlatform, $scope, $stateParams, UserData, Auth, $state, $ionicHistory, $ionicPopup) {

	$scope.brand = {};
	$scope.ApiEndpoint = ApiEndpoint;
	$scope.items = [];
	$scope.feeds = [];
	$scope.tmp = {};
	$scope.dataEdit = UserData.getDataTmp();

	/* detail travel */
	  $ionicModal.fromTemplateUrl('modal-umum-detail-travel.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modalTravel = modal;
	  });
	  $scope.showDetailTravel = function(data) {
	  	$scope.tmp = data;
	    $scope.modalTravel.show();
	    $scope.edit = false;
	  };
	  $scope.closeModalTravel = function() {
	    $scope.modalTravel.hide();
	  };


	/* detail rental */
	  $ionicModal.fromTemplateUrl('modal-umum-detail-rental.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modalRental = modal;
	  });
	  $scope.showDetailRental = function(data) {
	  	$scope.tmp = data;
	    $scope.modalRental.show();
	    $scope.edit = false;
	  };
	  $scope.closeModalRental = function() {
	    $scope.modalRental.hide();
	  };


	/* detail info */
	  $ionicModal.fromTemplateUrl('modal-umum-detail-info.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modalInfo = modal;
	  });
	  $scope.showDetailInfo = function(data) {
	  	$scope.tmp = data;
	    $scope.modalInfo.show();
	    $scope.edit = false;
	  };
	  $scope.closeModalInfo = function() {
	    $scope.modalInfo.hide();
	  };
	  	$scope.detilusaha = function(data){
		$state.go('app.umum-detilusaha');
		UserData.setDataTmp(data);
		
	}

    $scope.$on("$ionicView.beforeEnter", function(event, data){
		UserData.getItem($scope.dataEdit.kategori_usaha,$scope.dataEdit).success(function(data){
			
			UserData.setDataItems(data.data);

		});
		UserData.getInfo($scope.dataEdit).success(function(data){
			$scope.feeds = data.data;
		});
    });

	$scope.$watch(function(){ return UserData.getDataItems(); }, function(newValue, oldValue, scope) {
		$scope.items = newValue;
	}, true);

}])

.controller('itemCariLokasiCtrl', ['ApiEndpoint', '$timeout', 'uiGmapGoogleMapApi', 'uiGmapIsReady', '$ionicPlatform', '$scope', '$stateParams', 'UserData', 'Auth', '$state', '$ionicHistory', '$ionicPopup',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function (ApiEndpoint, $timeout, uiGmapGoogleMapApi, uiGmapIsReady, $ionicPlatform, $scope, $stateParams, UserData, Auth, $state, $ionicHistory, $ionicPopup) {

	$scope.brand = {};
	$scope.ApiEndpoint = ApiEndpoint;
	$scope.items = [];
	$scope.dataEdit = UserData.getDataTmp();

    $scope.icons = {
        start: {
            url: 'http://maps.google.com/mapfiles/ms/micons/blue.png',
            size: { width: 44, height: 32 },
            origin: { x: 0, y: 0 },
            anchor: { x: 22, y: 32 }
        },
        end: {
            url: 'http://maps.google.com/mapfiles/ms/micons/green.png',
            size: { width: 44, height: 32 },
            origin: { x: 0, y: 0 },
            anchor: { x: 22, y: 32 }
        }
    };

    $scope.fromDir = new google.maps.LatLng($scope.dataEdit.latitude_usaha, $scope.dataEdit.longitude_usaha);
    $scope.toDir = new google.maps.LatLng($scope.dataEdit.latitude_usaha, $scope.dataEdit.longitude_usaha);

    $scope.map = { 
    	center: { latitude: $scope.dataEdit.latitude_usaha, longitude: $scope.dataEdit.longitude_usaha }, zoom: 11,
        control: {}
    };

    $scope.from = { 
    	id : 1,
    	coords: { latitude: $scope.dataEdit.latitude_usaha, longitude: $scope.dataEdit.longitude_usaha },
    	icon : {
            url: 'http://maps.google.com/mapfiles/ms/micons/blue.png',
            size: { width: 44, height: 32 },
            origin: { x: 0, y: 0 },
            anchor: { x: 22, y: 32 }
        }};

    $scope.to = { 
    	id : 2,
    	coords: { latitude: $scope.dataEdit.latitude_usaha, longitude: $scope.dataEdit.longitude_usaha },
    	icon : {
            url: 'http://maps.google.com/mapfiles/ms/micons/green.png',
            size: { width: 44, height: 32 },
            origin: { x: 0, y: 0 },
            anchor: { x: 22, y: 32 }
        }};


    uiGmapGoogleMapApi.then(function (instances) {

		var options = {
		                enableHighAccuracy: true
		            };

		navigator.geolocation.getCurrentPosition(function(pos) {

						$scope.fromDir = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
					    $scope.from.coords.latitude = pos.coords.latitude;
					    $scope.from.coords.longitude = pos.coords.longitude;

					    $scope.printRoute();

		            }, 
		            function(error) {                    
		                alert('Unable to get location: ' + error.message);
		            }, options);   

    });

    $scope.printRoute = function () {

	    var directionsService = new google.maps.DirectionsService();
	    var directionsRequest = {
	        origin: $scope.fromDir,
	        destination: $scope.toDir,
	        optimizeWaypoints: true,
	        travelMode: google.maps.DirectionsTravelMode.DRIVING,
	        unitSystem: google.maps.UnitSystem.METRIC
	    };
	    
	    var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});

	    directionsDisplay.setMap($scope.map.control.getGMap());

        directionsService.route(directionsRequest, function (response, status) {

            if (status === google.maps.DirectionsStatus.OK) {

            	directionsDisplay.setDirections(response);

            } else {
                console.log(status);
            }
        });
    }

    $scope.getFrom = function(){

		var options = {
		                enableHighAccuracy: true
		            };

		navigator.geolocation.getCurrentPosition(function(pos) {

						$scope.fromDir = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
					    $scope.from.coords.latitude = pos.coords.latitude;
					    $scope.from.coords.longitude = pos.coords.longitude;

		            }, 
		            function(error) {                    
		                alert('Unable to get location: ' + error.message);
		            }, options);    
		            	
    }

/*    $timeout(function(){
    	
    	$scope.getFrom();
        $scope.printRoute();

    },2000);*/

}])

.controller('itemCtrl', ['ApiEndpoint', '$ionicModal','$ionicSlideBoxDelegate', '$ionicPlatform', '$scope', '$stateParams', 'UserData', 'Auth', '$state', '$ionicHistory', '$ionicPopup', '$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', '$cordovaDevice', '$ionicActionSheet',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function (ApiEndpoint,$ionicModal ,$ionicSlideBoxDelegate, $ionicPlatform, $scope, $stateParams, UserData, Auth, $state, $ionicHistory, $ionicPopup, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaDevice, $ionicActionSheet) {
	
	$scope.brand = {};
	$scope.items = {};
	$scope.type = $stateParams.type;
	$scope.dataEdit = UserData.getDataTmp();
	$scope.ApiEndpoint = ApiEndpoint;
	$scope.itemStatus = { status : false, text : 'Submit'};
	Auth.isBrandLogin();

	$scope.toDate = function(data){

		var dates = new Date(data.waktu_itemtravel);

		return dates;
	}

	$scope.store = function(valid,data){

		$scope.itemStatus.text = 'Submitting';
		$scope.itemStatus.status = true;
		UserData.storeItem($scope.type,$scope.brand,data).success(function(data){
			if(data.status){
				
				$ionicHistory.nextViewOptions({disableBack:true});
				
				$state.go('app.list-'+$scope.type,{ type : $scope.type});

				UserData.getItem($scope.type,$scope.brand).success(function(data){
					UserData.setDataItems(data.data);
				});

			}
		}).error(function(){

		}).finally(function(){
			$scope.itemStatus = { status : false, text : 'Submit'};
		});

	}

	$scope.deleteItem = function(data) {

		var nama = $scope.type == 'travel' ? data.tujuan_itemtravel : data.namakendaraan_itemrental;

		var confirmPopup = $ionicPopup.confirm({
		 title: 'Menghapus '+nama,
		 template: 'Apa anda yaking akan menghapus '+nama+'?'
		});

		confirmPopup.then(function(res) {
		 if(res) {
			UserData.deleteItem($scope.type,$scope.brand,data).success(function(data){
				if(data.status){

					UserData.getItem($scope.type,$scope.brand).success(function(data){
						UserData.setDataItems(data.data);
					});
					
				}
			}).error(function(){

			}).finally(function(){
				$scope.usahaEditStatus = { text : 'Submit', status : false};
			});
		 }
		});

	};

	$scope.edit = function(data){
		
		if(data.waktu_itemtravel) data.waktu_itemtravel = $scope.toDate(data.waktu_itemtravel);

		UserData.setDataTmp(data);
		$state.go('app.edit-item'+$scope.type,{ type : $scope.type});

	}

	// -----------------detil rental-------------------
	  $ionicModal.fromTemplateUrl('modal-umum-detail-rental.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modalRental = modal;
	  });
	  $scope.showDetailRental = function(data) {
	  	$scope.tmp = data;
	    $scope.modalRental.show();
	  	$scope.edit = false;
	  };
	  $scope.closeModalRental = function() {
	    $scope.modalRental.hide();
	  };
	  // ----------------------------------------------

	  // --------------detil travel-----------------------------------
	    $ionicModal.fromTemplateUrl('modal-umum-detail-travel.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modalTravel = modal;
	  });
	  $scope.showDetailTravel = function(data) {
	  	$scope.tmp = data;
	    $scope.modalTravel.show();
	    $scope.edit = false;
	  };
	  $scope.closeModalTravel = function() {
	    $scope.modalTravel.hide();
	  };
	  // ------------------------------------------------------


	$scope.update = function(valid,data){

		$scope.itemStatus.text = 'Updating';
		$scope.itemStatus.status = true;
		UserData.updateItem($scope.type,$scope.brand,data).success(function(data){
			if(data.status){
				
				$ionicHistory.nextViewOptions({disableBack:true});
				
				$state.go('app.list-travel',{ type : $scope.type});

				UserData.getItem($scope.type,$scope.brand).success(function(data){
					UserData.setDataItems(data.data);
				});

			}
		}).error(function(){

		}).finally(function(){
			$scope.itemStatus = { status : false, text : 'Submit'};
		});

	}

	$scope.$watch(function(){ return UserData.getDataItems(); }, function(newValue, oldValue, scope) {
		$scope.items = newValue;
	}, true);

	$scope.$watch(function(){ return Auth.getBrandData(); }, function(newValue, oldValue, scope) {
		$scope.brand = newValue;
		if(newValue.id_usaha){
			UserData.getItem($scope.type,newValue).success(function(data){
				UserData.setDataItems(data.data);
			});
		}
	}, true);

	$scope.image = null;
	$scope.showAlert = function(title, msg) {
	    var alertPopup = $ionicPopup.alert({
	      title: title,
	      template: msg
	    });
	};

	var Camera = navigator.camera;
	$scope.loadImage = function() {

		$ionicPlatform.ready(function(){

		  var options = {
		    titleText: 'Select Image Source',
		     buttons: [
		       { text: 'Load from Library' },
		       { text: 'Use Camera' }
		     ],
		     titleText: 'Modify your album',
		     cancelText: 'Cancel',
		     cancel: function() {
		          return true;
		        },
		    buttonClicked : function(btnIndex){
			    var type = null;
			    if (btnIndex === 0) {
			      type = Camera.PictureSourceType.PHOTOLIBRARY;
			    } else if (btnIndex === 1) {
			      type = Camera.PictureSourceType.CAMERA;
			    }

			    if (type !== null) {
			      $scope.selectPicture(type);
			    }

			    return true;
		    }
		  };

		  $ionicActionSheet.show(options);  

		});

	};

	$scope.selectPicture = function(sourceType) {

		$ionicPlatform.ready(function(){

		  var options = {
		    quality: 100,
		    destinationType: Camera.DestinationType.FILE_URI,
		    sourceType: sourceType,
		    saveToPhotoAlbum: false
		  };
		 
		  $cordovaCamera.getPicture(options).then(function(imagePath) {

		    // Grab the file name of the photo in the temporary directory
		    var currentName = imagePath.replace(/^.*[\\\/]/, '');
		 
		    //Create a new name for the photo
		    var d = new Date(),
		    n = d.getTime(),
		    newFileName =  n + ".jpg";
		 
		    // If you are trying to load image from the gallery on Android we need special treatment!
		    if ($cordovaDevice.getPlatform() == 'Android' && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
		    
			    document.addEventListener('deviceready', function () {

					window.FilePath.resolveNativePath(imagePath, function(entry) {
						window.resolveLocalFileSystemURL(entry, success, fail);

						function fail(e) {
						  console.error('Error: ', e);
						}

						function success(fileEntry) {

						  var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
						  // Only copy because of access rights
						  $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName).then(function(success){
						    
						    $scope.image = newFileName;

						  }, function(error){
						  	console.log(error);
						    $scope.showAlert('Error', error.exception);						    

						  });

						};
						}
					);

			    });

		    } else {

		      var namePath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
		      // Move the file to permanent storage
		      document.addEventListener('deviceready', function () {

			      $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(function(success){

			        $scope.image = newFileName;

			      }, function(error){
			      	console.log(error);
			        $scope.showAlert('Error', error.exception);
			      });

		      });


		    }
		  },
		  function(err){
		    // Not always an error, maybe cancel was pressed...
		    console.log(err);

		  })

		});

	};

	$scope.pathForImage = function(image) {

		var url = '';

		url = cordova.file.dataDirectory + image;

		return url;
	};

	$scope.usahaEditPhoto = { status : false, text : 'Upload' };
	$scope.uploadImage = function(parent,type) {

		$ionicPlatform.ready(function(){

		  // File for Upload
		  var targetPath = $scope.pathForImage($scope.image);
		 
		  // File name only
		  var filename = $scope.image;
		  var id = type == 'travel' ? parent.id_itemtravel : parent.id_itemrental;
		  var url = ApiEndpoint.url+'usaha/item/'+id+'/photo/'+$scope.brand.id_usaha;

		  var options = {

		    fileKey: "photo",
		    fileName: filename,
		    chunkedMode: false,
            mimeType: "image/jpg",
            params : { type : type }

		  };

		  $scope.usahaEditPhoto.status = true;
		  $scope.usahaEditPhoto.text = 'Uploading';

			var ft = new FileTransfer();

			 ft.upload(targetPath, url, function(result){
			 	
			 	var data = JSON.parse(result.response);

			  	if(data.status){

			  		$scope.image = null;

			  		if(data.data.waktu_itemtravel) data.data.waktu_itemtravel = new Date(data.data.waktu_itemtravel);

			  		$scope.dataEdit = data.data;
			  		
			  		$ionicSlideBoxDelegate.update();

					$scope.showAlert('Success', 'Image upload finished.');

			  	}else{

			  		$scope.showAlert('Failed', 'Image upload unsuccessful');

			  	}

			  	console.log(data);

				  $scope.usahaEditPhoto.status = false;
				  $scope.usahaEditPhoto.text = 'Upload';

			 }, function(error){

			 	console.log(JSON.stringify(error));
		  		$scope.usahaEditPhoto.status = false;
				$scope.usahaEditPhoto.text = 'Upload';

			 }, options);

		});

	}

	$scope.$watch('image', function(newValue, oldValue, scope) {
		$scope.image = newValue;
	}, true);

}])

.controller('infoUmumCtrl', ['ApiEndpoint','$ionicModal','$scope', '$stateParams', 'UserData', 'Auth', '$state', '$ionicHistory', '$ionicPopup','$stateParams',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function (ApiEndpoint, $ionicModal, $scope, $stateParams, UserData, Auth, $state, $ionicHistory, $ionicPopup) {
	
	$scope.brand = {};
	$scope.items = [];
	$scope.ApiEndpoint = ApiEndpoint;
	$scope.feeds = [];
	$scope.type = 'travel';

	UserData.getFeed($scope.type).success(function(data){
		$scope.feeds = data.data;
	}).error(function(){

	}).finally(function(){

	});

	UserData.getUsahaSearch($scope.type).success(function(data){
		$scope.items = data.data;
	}).error(function(){

	}).finally(function(){

	});

	$scope.changeInfo = function(type){
		$scope.type = type;
		$scope.items = [];
		UserData.getUsahaSearch(type).success(function(data){
			$scope.items = data.data;
		}).error(function(){

		}).finally(function(){

		});

	}

	/* detail info */
	  $ionicModal.fromTemplateUrl('modal-umum-detail-info.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modalInfo = modal;
	  });
	  $scope.showDetailInfo = function(data) {
	  	$scope.tmp = data;
	    $scope.modalInfo.show();
	    $scope.edit = false;
	  };
	  $scope.closeModalInfo = function() {
	    $scope.modalInfo.hide();
	  };

	$scope.detilusaha = function(data){
		$state.go('app.umum-detilusaha');
		UserData.setDataTmp(data);
		
	}

	$scope.changeFeed = function(type){
		$scope.type = type;
		$scope.feeds = [];
		UserData.getFeed(type).success(function(data){
			$scope.feeds = data.data;
		}).error(function(){

		}).finally(function(){

		});

	}
}])


.controller('feedCtrl', ['ApiEndpoint', '$ionicModal','$ionicPopup', '$scope', '$stateParams', 'UserData', 'Auth', '$state','$ionicPlatform','$ionicActionSheet','$cordovaCamera', '$cordovaFile', '$cordovaFileTransfer', '$cordovaDevice',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller

// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName

function (ApiEndpoint,$ionicModal, $ionicPopup, $scope, $stateParams, UserData, Auth, $state, $ionicPlatform, $ionicActionSheet,$cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaDevice) {
	
	$scope.feedStatus = { text : 'Submit', status : false};
	$scope.statusData = { isi_info : '' };
	$scope.feeds = [];
	$scope.tmp={};

	$scope.ApiEndpoint = ApiEndpoint;
	$scope.auth = Auth;
	$scope.brand = Auth.getBrandData();
	Auth.isBrandLogin();

	$scope.storeStatus = function(valid,data){
		$scope.feedStatus.text = 'Submitting';
		$scope.feedStatus.status = false;
		UserData.storeInfo(Auth.getBrandData(),data).success(function(data){
			if(data.status){
				UserData.setDataStatusSingle(data.data);
			}
		}).error(function(){}).finally(function(){
			$scope.feedStatus.text = 'Submit';
			$scope.feedStatus.status = false;
			$scope.statusData = { isi_info : '' };
		});

	}

	$scope.$watch(function(){ return UserData.getDataStatus(); }, function(newValue, oldValue, scope) {
		$scope.feeds = newValue;
	},true);

	$scope.$watch(function(){ return Auth.getBrandData(); }, function(newValue, oldValue, scope) {
		$scope.brand = newValue;
		if(newValue.id_usaha){
			UserData.getInfo(newValue).success(function(data){
				UserData.setDataStatus(data.data);
			});
		}
	}, true);

	$scope.image = null;
	$scope.showAlert = function(title, msg) {
	    var alertPopup = $ionicPopup.alert({
	      title: title,
	      template: msg
	    });
	};	

	$scope.updateTextArea = function() {
    var element = document.getElementById("TextArea");
    element.style.height =  element.scrollHeight + "px";

	}


	// ---------------------------
	 $scope.deleteFeed = function(data) {
	   var confirmPopup = $ionicPopup.confirm({
	     title: 'Menghapus Info',
	     template: 'Apa anda yakin akan menghapus ?'
	   });

	   confirmPopup.then(function(res) {
	     if(res) {
			UserData.deleteInfo(Auth.getBrandData(),data).success(function(data){
				if(data.status){

					UserData.getInfo(Auth.getBrandData()).success(function(data){
						UserData.setDataStatus(data.data);
					});
					
				}
			}).error(function(){

			}).finally(function(){
				$scope.usahaEditStatus = { text : 'Submit', status : false};
			});
	     }
	   });
	 };

	 // --------------------------------- detail info usaha--------------
	 $ionicModal.fromTemplateUrl('modal-umum-detail-info.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modalInfo = modal;
	  });
	  $scope.showDetailInfo = function(data) {
	  	$scope.tmp = data;
	    $scope.modalInfo.show();
	  };
	  $scope.closeModalInfo = function() {
	    $scope.modalInfo.hide();
	  };
// ----------------------------------------

	var Camera = navigator.camera;
	$scope.loadImage = function() {

		$ionicPlatform.ready(function(){

		  var options = {
		    titleText: 'Tambah Gambar',
		     buttons: [
		       { text: 'Load from Library' },
		       { text: 'Use Camera' }
		     ],
		     titleText: 'Modify your album',
		     cancelText: 'Cancel',
		     cancel: function() {
		          return true;
		        },
		    buttonClicked : function(btnIndex){
			    var type = null;
			    if (btnIndex === 0) {
			      type = Camera.PictureSourceType.PHOTOLIBRARY;
			    } else if (btnIndex === 1) {
			      type = Camera.PictureSourceType.CAMERA;
			    }

			    if (type !== null) {
			      $scope.selectPicture(type);
			    }

			    return true;
		    }
		  };

		  $ionicActionSheet.show(options);  

		});

	};

	$scope.updateInfo = function(valid,data){

		$scope.usahaEditInfo.text = 'Submitting';
		$scope.usahaEditInfo.status = true;
		UserData.updateInfo(Auth.getBrandData(),data).success(function(data){
			if(data.status){
				
				$ionicHistory.nextViewOptions({disableBack:true});
				$state.go('app.user-feed');
				//UserData.updateDataUsahaSingle(data.data);
			}
		}).error(function(){

		}).finally(function(){
			$scope.usahaEditInfo = { text : 'Submit', status : false};
		});

	}

	 $scope.editInfo = function(data){
		$state.go('app.edit-infousaha');
		UserData.setDataTmp(data);
	}
	
	
	$scope.selectPicture = function(sourceType) {

		$ionicPlatform.ready(function(){

		  var options = {
		    quality: 100,
		    destinationType: Camera.DestinationType.FILE_URI,
		    sourceType: sourceType,
		    saveToPhotoAlbum: false
		  };
		 
		  $cordovaCamera.getPicture(options).then(function(imagePath) {

		    // Grab the file name of the photo in the temporary directory
		    var currentName = imagePath.replace(/^.*[\\\/]/, '');
		 
		    //Create a new name for the photo
		    var d = new Date(),
		    n = d.getTime(),
		    newFileName =  n + ".jpg";
		 
		    // If you are trying to load image from the gallery on Android we need special treatment!
		    if ($cordovaDevice.getPlatform() == 'Android' && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
		    
			    document.addEventListener('deviceready', function () {

					window.FilePath.resolveNativePath(imagePath, function(entry) {
						window.resolveLocalFileSystemURL(entry, success, fail);

						function fail(e) {
						  console.error('Error: ', e);
						}

						function success(fileEntry) {

						  var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
						  // Only copy because of access rights
						  $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName).then(function(success){
						    
						    $scope.image = newFileName;

						  }, function(error){
						  	console.log(error);
						    $scope.showAlert('Error', error.exception);						    

						  });

						};
						}
					);

			    });

		    } else {

		      var namePath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
		      // Move the file to permanent storage
		      document.addEventListener('deviceready', function () {

			      $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(function(success){

			        $scope.image = newFileName;

			      }, function(error){
			      	console.log(error);
			        $scope.showAlert('Error', error.exception);
			      });

		      });


		    }
		  },
		  function(err){
		    // Not always an error, maybe cancel was pressed...
		    console.log(err);

		  })

		});

	};

	$scope.pathForImage = function(image) {

		var url = '';

		url = cordova.file.dataDirectory + image;

		return url;
	};

	$scope.uploadImage = function(data) {
		
		if(!data.isi_info) return false;

		$ionicPlatform.ready(function(){

		  // File for Upload
		  var targetPath = $scope.image ? $scope.pathForImage($scope.image) : false;
		 
		 if(!targetPath){

				$scope.feedStatus.text = 'Submitting';
				$scope.feedStatus.status = true;
		 	UserData.storeInfo(Auth.getBrandData(),$scope.statusData).success(function(data){

		 		if(data.status){

					UserData.setDataStatusSingle(data.data);
					$scope.statusData = { isi_info : '' };
					$scope.image = null;	

		 		}

		 	}).error(function(){

		 	}).finally(function(){

				$scope.feedStatus.text = 'Submit';
				$scope.feedStatus.status = false;
		 		return true;

		 	});

		 }

		  // File name only
		  var filename = $scope.image;
		  var url = ApiEndpoint.url + 'usaha/feed/'+$scope.brand.id_usaha;

		  var options = {

		    fileKey: "photo",
		    fileName: filename,
		    chunkedMode: false,
            mimeType: "image/jpg",
            params : $scope.statusData

		  };

			var ft = new FileTransfer();
				$scope.feedStatus.text = 'Submitting';
				$scope.feedStatus.status = true;
			 ft.upload(targetPath, url, function(result){
			 	
			 	var data = JSON.parse(result.response);
				$scope.feedStatus.text = 'Submit';
				$scope.feedStatus.status = false;

				if(data.status){
					UserData.setDataStatusSingle(data.data);
					$scope.statusData = { isi_info : '' };
					$scope.image = null;
				}

			    $scope.showAlert('Success', 'Image upload finished.');

			 }, function(error){

			 	console.log(JSON.stringify(error));
				$scope.feedStatus.text = 'Submit';
				$scope.feedStatus.status = false;

			 }, options);

		});

	}

	$scope.$watch('image', function(newValue, oldValue, scope) {
		$scope.image = newValue;
	}, true);

}])

.controller('loginCtrl', ['$scope', '$stateParams', 'UserData', 'Auth', '$state',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, UserData, Auth, $state) {
	
	$scope.loginStatus = { text : 'Login', status : false};

	$scope.login = function(valid,data){
		$scope.loginStatus.text = 'Loggin In';
		$scope.loginStatus.status = true;
		UserData.loginUser(data).success(function(data){
			if(data.status){
				Auth.setUser(data.data);
				$state.go('app.user-usaha');
			}
		}).error(function(){}).finally(function(){
			$scope.loginStatus.text = 'Login';
			$scope.loginStatus.status = false;
		});

	}

}])

.controller('registerCtrl', ['$scope', '$stateParams', 'UserData', 'Auth', '$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, UserData, Auth, $state) {
	
	$scope.registerStatus = { text : 'Register', status : false};

	$scope.register = function(valid,data){
		$scope.registerStatus.text = 'Registering';
		$scope.registerStatus.status = true;
		UserData.registerUser(data).success(function(data){
			if(data.status){
				Auth.setUser(data.data);
				$state.go('app.menu');
			}
		}).error(function(){}).finally(function(){
			$scope.registerStatus.text = 'Register';
			$scope.registerStatus.status = false;
		});

	}

}])

.controller('tabpengelolaCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

}])

.controller('pengunjungCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

}])

.controller('tabtravelCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {
	
}])

.controller('tabrentalCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {
	
}])
   
.controller('daftarCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('editPengelolaCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('pengelolaCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('listRentalCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('infoUsahaCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('listTravelCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('travelCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('rentalCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('tambahItemRentalCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('itemRentalCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('editItemRentalCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('detilItemRentalCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('tambahItemTravelCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('detilItemTravelCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('itemTravelCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('editItemTravelCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('editUsahaCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('tambahUsahaCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

}


])
   
.controller('detilUsahaCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('lihatDaftarCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('lihatSekitarCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('lihatInfoCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('listInfoCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('cariCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('detailItemInfoCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('detailInfoCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('itemInfoCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('tambahInfoUsahaCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('editInfoUsahaCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('pageCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.directive('fileUpload', function() {
  return {
    restrict: 'AE',
    scope: {
      file: '@'
    },
    link: function(scope, el, attrs){
      console.log(attrs);
      el.bind('change', function(event){
        var files = event.target.files;
        var file = files[0];
        console.log(file);
        if(file && typeof(file) !== undefined && file.size > 0){
          scope.file = file;
          scope.$parent.file = file;
        } else {
          scope.file = {};
          scope.$parent.file = {};
        }
        scope.$apply();
      });
    }
  };
})
