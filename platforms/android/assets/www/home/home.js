'use strict';

angular.module('home', ['ngRoute', 'ngFileUpload', 'ngCordova'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'home/home.html',
            controller: 'homeCtrl',
            resolve: {

                // set vc name as selected
                selectedVc: function ($route, virtualCollectionsService) {

                    var vcData = virtualCollectionsService.listUserVirtualCollectionData($route.current.params.vcName);
                    return vcData;
                },
                // do a listing
                pagingAwareCollectionListing: function ($route, collectionsService) {
                    var vcName = 'starred' //$route.current.params.vcName;

                    var path = $route.current.params.path;
                    if (path == null) {
                        path = "";
                    }

                    return collectionsService.listCollectionContents(vcName, path, 0);
                }



            }
        }).when('/home', {
            templateUrl: 'home/home.html',
            controller: 'homeCtrl',
            resolve: {
                // set vc name as selected
                selectedVc: function ($route) {

                    return null;
                },
                // do a listing
                pagingAwareCollectionListing: function ($route, collectionsService) {
                    return {};
                }

            }
        });
    }])



    .controller('homeCtrl', ['$scope',  '$log', 'Upload', '$http', '$location', 'MessageService', 'globals', 'virtualCollectionsService', 'breadcrumbsService','$cordovaFileTransfer', 'collectionsService', function ($scope, $log, Upload, $http, $location, MessageService, $globals, $virtualCollectionsService, breadcrumbsService, $cordovaFileTransfer, $collectionsService) {



        $scope.listVirtualCollections = function (irods) {

            $log.info("getting starred collection");

            return $http({method: 'GET', url: $globals.backendUrl('collection/Starred%20Files?offset=0&path=')}).success(function (data) {
                $scope.collectionListingDropdown = data;
            }).error(function () {
                $scope.collectionListingDropdown = [];
            });
        };

        $scope.getBreadcrumbPaths = function () {

            breadcrumbsService.setCurrentAbsolutePath($scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath);
            $scope.breadcrumb_full_array = breadcrumbsService.getWholePathComponents();
            $scope.breadcrumb_full_array_paths = [];
            var totalPath = "";
            for (var i = 0; i < $scope.breadcrumb_full_array.length; i++) {
                totalPath = totalPath + "/" + $scope.breadcrumb_full_array[i];
                $scope.breadcrumb_full_array_paths.push({b: $scope.breadcrumb_full_array[i], path: totalPath});
            }
            if ($scope.breadcrumb_full_array_paths.length > 5) {
                $scope.breadcrumb_compressed_array = $scope.breadcrumb_full_array_paths.splice(0, ($scope.breadcrumb_full_array_paths.length) - 5);
            }
        };
        // var download_path
        if ($scope.pagingAwareCollectionListing && $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.pathComponents) {

            $scope.current_collection_index = $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.pathComponents.length - 1;
        }

        /**
         * Upon the selection of an element in a breadrumb link, set that as the location of the browser, triggering
         * a view of that collection
         * @param index
         */
        $scope.goToBreadcrumb = function (path) {

            if (!path) {
                $log.error("cannot go to breadcrumb, no path");
                return;
            }
            $location.path("/home/root");
            $location.search("path", path);

        };
        $scope.delete_action = function (){


            //var delete_objects = $('.ui-selected');
            //var delete_paths = [];
            //delete_objects.each(function () {
            //    if ($(this).attr('id') != undefined) {
            //        delete_paths.push($(this).attr('id'));
            //    }
            //    ;
            //});
            ////delete_paths = delete_paths.substring(0, delete_paths.length - 1);
            //$log.info('Deleting:' + delete_paths);
            //return $http({
            //    method: 'DELETE',
            //    url: $globals.backendUrl('file'),
            //    params: {
            //        path: delete_paths
            //    }
            //}).then(function (data) {
            //    return $collectionsService.listCollectionContents($scope.selectedVc.data.uniqueName, $scope.pagingAwareCollectionListing.pagingAwareCollectionListingDescriptor.parentAbsolutePath, 0);
            //}).then(function (data) {
            //    MessageService.info("Deletion completed!");
            //    $scope.pagingAwareCollectionListing = data;
            //    $scope.pop_up_close_clear();
            //})




            var delete_paths = $scope.dataProfile.domainObject.absolutePath;
            $log.info('Deleting:'+delete_paths);
            return $http({
                method: 'DELETE',
                url: $globals.backendUrl('file'),
                params: {
                    path : delete_paths
                }
            }).then(function (data) {
                MessageService.info("Deletion completed!");
                $('.profileDets').css('-webkit-filter', 'blur(0px)')
                $('.mui-appbar').css('-webkit-filter', 'blur(0px)')
                $('.profileListDiv').css('-webkit-filter', 'blur(0px)')
                $('.filePreview').css('-webkit-filter', 'blur(0px)')
                window.history.back();
            })
        };


        $scope.goSubCollection = function(vcName, path) {

            $log.info("Going to subcollection " + vcName);
            $log.info("at path: " + path);

            $location.url("/subCol/");
            $location.search("path", path);

        }

        $scope.listVirtualCollections();

        $scope.goHome = function(){
            $location.path('/home/');
        }

        $scope.goLog = function(){
            $location.path('/login/');
        }

        $scope.goUpload = function() {
            $location.path('/upload/');
        }

        $scope.logout_func = function (){
            var promise = $http({
                method: 'DELETE',
                url: $globals.backendUrl('login')
            }).then(function (response) {
                // The then function here is an opportunity to modify the response
                // The return value gets picked up by the then in the controller.

                return response.data;
            });
            // Return the promise to the controller
            $location.path("/login");
            return promise;
        };

        $scope.showMenu = function(){
            var url = $location.url();
            if(url == '/login'){
                return true;
            }else{
                return false;
            }
        };

        $scope.shouldHideUpload = function(){
            var url = $location.url();
            url = url.substr(0,5);
            if( url == '/home' || url == '/prof'){
                return true;
            }else{
                return false;
            }
        };

        $scope.selectProfile = function (irodsAbsolutePath) {
            $log.info("going to Data Profile");
            if (!irodsAbsolutePath) {
                $log.error("missing irodsAbsolutePath")
                MessageService.danger("missing irodsAbsolutePath");
            }


            $location.url("/profile/");
            $location.search("path", irodsAbsolutePath);

        }

        //File Actions
        $scope.getDownloadLink = function() {

            var url = $globals.backendUrl('download') + "?path=" + $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
            $log.info("Download URL is: " + url);

            return url;

        };


        $scope.downloadFile = function(folder){

            var url = $globals.backendUrl('download') + "?path=" + $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;

            url = encodeURI(url);
            console.log("***** Download url is " + url);

            var filePath = folder + $scope.dataProfile.childName;

            filePath = encodeURI(filePath);

            console.log("***** filepath is saved at "+filePath);


            var fileTransfer = new FileTransfer();
            fileTransfer.download(
                url,
                filePath,
                function(error) {
                    alert(error.source);
                },
                false,
                {
                    headers: {
                        "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                    }
                }
            );


            //$cordovaFileTransfer.download(url, filePath, {}, true).then(function (result) {
            //    console.log('Success :)');
            //}, function (error) {
            //    console.log('Error :(');
            //}, function (progress) {
            //    // PROGRESS HANDLING GOES HERE
            //});

            //$cordovaFileTransfer.download(
            //        url,
            //        filePath,
            //        function(entry){
            //            console.log('Worked!!!',filePath);
            //        },
            //        function(error){
            //            console.log('failed, something went wrong :(');
            //        }
            //);
        }





        $scope.delete_pop_up_open = function(){
            $('.renamer').fadeOut(100);
            $('.pop_up_window').fadeIn(100);
            $(".delete_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="home/img/Icons/data_object_icon.png">'+$scope.dataProfile.childName+'</div></li>');
            $('.deleter').fadeIn(100);
            $('.profileDets').css('-webkit-filter', 'blur(20px)')
            $('.mui-appbar').css('-webkit-filter', 'blur(20px)')
            $('.profileListDiv').css('-webkit-filter', 'blur(20px)')
            $('.filePreview').css('-webkit-filter', 'blur(20px)')

        };

        $scope.pop_up_close = function () {
            $('.pop_up_window').fadeOut(100);
            $('.deleter').fadeOut(100);
            $('.renamer').fadeOut(100);
            $('.profileDets').css('-webkit-filter', 'blur(0px)')
            $('.mui-appbar').css('-webkit-filter', 'blur(0px)')
            $('.profileListDiv').css('-webkit-filter', 'blur(0px)')
            $('.filePreview').css('-webkit-filter', 'blur(0px)')

        };




        $scope.rename_pop_up_open = function() {
            $('.deleter').fadeOut(100);
            $('.pop_up_window').fadeIn(100);
            $('.renamer').fadeIn(100);
            var name_of_selection = $('.ui-selected').children('.list_content').children('.data_object').text();
            $('.selected_object').append(name_of_selection);
            $('.profileDets').css('-webkit-filter', 'blur(20px)')
            $('.mui-appbar').css('-webkit-filter', 'blur(20px)')
            $('.profileListDiv').css('-webkit-filter', 'blur(20px)')
            $('.filePreview').css('-webkit-filter', 'blur(20px)')

        };

        $scope.rename_action = function (){
            var rename_path = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
            var new_name = $('#new_renaming_name').val();
            var old_url = window.location;
            var n = String(old_url).lastIndexOf("%2F");
            var new_url = String(old_url).substr(0,n);
            var new_url = new_url + "%2F" + new_name;

            $('.profileDets').css('-webkit-filter', 'blur(0px)')
            $('.mui-appbar').css('-webkit-filter', 'blur(0px)')
            $('.profileListDiv').css('-webkit-filter', 'blur(0px)')
            $('.filePreview').css('-webkit-filter', 'blur(0px)')

            $log.info('Renaming:'+rename_path);
            return $http({
                method: 'PUT',
                url: $globals.backendUrl('rename'),
                params: {path: rename_path, newName: new_name}
            }).success(function (data) {
                location.assign(new_url);
                window.history.go(-2);

            })

        };


       // <!---------------------------------------------------->

        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });

        $scope.multiple = true;
        $scope.files_to_upload = [];
        $scope.files_name = [];
        $scope.copy_source = "";
        $scope.copy_target = "";
        $scope.upload_pop_up_open = function () {
            $('.pop_up_window').fadeIn(100);
            $('.uploader').fadeIn(100);
        };

        $scope.stage_files = function (files) {
            if (files && files.length) {
                $(".upload_container_result").css('display', 'block');

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var pre_existing = $.inArray(file.name, $scope.files_name);
                    if (pre_existing === 0) {
                        MessageService.danger('There is already a file named "' + file.name + '" on your list');
                    } else {
                        $scope.files_to_upload.push(file);
                        $scope.files_name.push(file.name);
                        $(".upload_container_result ul").append('<li id="uploading_item_' + i + '" class="light_back_option_even"><div class="col-xs-10 list_content"><img src="icons/data_object_icon.png">' + file.name + '</div></li>');
                    }
                }
            }

        }

        $scope.upload = function () {

            if ($scope.files_to_upload && $scope.files_to_upload.length) {
                for (var i = 0; i < $scope.files_to_upload.length; i++) {
                    var file = $scope.files_to_upload[i];
                    Upload.upload({
                        url: $globals.backendUrl('file'),
                        fields: {collectionParentName: '/tempZone/home/danb/cesar/'},
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $log.info(progressPercentage);

                    }).then(function (data) {
                        $scope.pagingAwareCollectionListing = data;
                        $scope.pop_up_close();
                        $scope.files_to_upload = [];
                        $scope.files_name = [];
                        $log.info("File Uploaded");
                    });
                }
            }
        };




    }])

    .factory('virtualCollectionsService', ['$http', '$log', 'globals', function ($http, $log, globals) {
        var virtualCollections = [];
        var virtualCollectionContents = [];
        var selectedVirtualCollection = {};

        return {


            listUserVirtualCollections: function () {
                $log.info("getting virtual colls");
                return $http({method: 'GET', url: globals.backendUrl('virtualCollection')}).success(function (data) {
                    virtualCollections = data;
                }).error(function () {
                    virtualCollections = [];
                });
            },

            listUserVirtualCollectionData: function (vcName) {
                $log.info("listing virtual collection data");

                if (!vcName) {
                    virtualCollectionContents = [];
                    return;
                }

                return $http({
                    method: 'GET',
                    url: globals.backendUrl('virtualCollection/') + vcName
                }).success(function (data) {
                    virtualCollections = data;
                }).error(function () {
                    virtualCollections = [];
                });

            }

        };



    }])


    .factory('collectionsService', ['$http', '$log', 'globals', function ($http, $log, $globals) {

        var pagingAwareCollectionListing = {};

        return {

            selectVirtualCollection: function (vcName) {
                //alert(vcName);
            },

            /**
             * List the contents of a collection, based on the type of virtual collection, and any subpath
             * @param reqVcName
             * @param reqParentPath
             * @param reqOffset
             * @returns {*|Error}
             */
            listCollectionContents: function (reqVcName, reqParentPath, reqOffset) {
                $log.info("doing get of the contents of a virtual collection");

                if (!reqVcName) {
                    $log.error("recVcName is missing");
                    throw "reqMcName is missing";
                }

                if (!reqParentPath) {
                    reqParentPath = "";
                }

                if (!reqOffset) {
                    reqOffset = 0;
                }

                $log.info("requesting vc:" + reqVcName + " and path:" + reqParentPath);
                return $http({
                    method: 'GET',
                    url: $globals.backendUrl('collection/Starred%20Files?offset=0&path='),
                    params: {path: reqParentPath, offset: reqOffset}
                }).success(function (response) {
                    pagingAwareCollectionListing = response.data;

                }).error(function () {
                    pagingAwareCollectionListing = {};

                });

            },
            addNewCollection: function (parentPath, childName) {
                $log.info("addNewCollection()");
            }


        };


    }])

;
