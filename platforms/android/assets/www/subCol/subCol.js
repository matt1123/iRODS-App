'use strict';

angular.module('subCol', ['ngRoute', 'ngFileUpload'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/subCol', {
            templateUrl: 'subCol/subCol.html',
            controller: 'subColCtrl',
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
        }).when('/subCol', {
            templateUrl: 'subCol/subCol.html',
            controller: 'subColCtrl',
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

    .controller('subColCtrl', ['$scope',  '$log', '$http', 'Upload', '$location', 'globals', function ($scope, $log, $http, Upload, $location, $globals) {

        $scope.listVirtualCollections = function () {

            var url = $location.url();
            url = url.substring(8);

            return $http({method: 'GET', url: $globals.backendUrl("collection/Starred%20Files?offset=0&" + url)}).success(function (data) {
                $scope.collectionListingInSubcol = data;
            }).error(function () {
                $scope.collectionListinginSubCol = [];
            });
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

        $scope.delete_pop_up_open = function(){
            $('.renamer').fadeOut(100);
            $('.pop_up_window').fadeIn(100);
            $(".delete_container ul").append('<li class="light_back_option_even"><div class="col-xs-7 list_content"><img src="home/img/Icons/data_object_icon.png">'+$scope.dataProfile.childName+'</div></li>');
            $('.deleter').fadeIn(100);
        };

        $scope.pop_up_close = function () {
            $('.pop_up_window').fadeOut(100);
            $('.deleter').fadeOut(100);
            $('.renamer').fadeOut(100);
        };

        $scope.selectProfile = function (irodsAbsolutePath) {
            $log.info("going to Data Profile");
            $log.info("at: " + irodsAbsolutePath);
            if (!irodsAbsolutePath) {
                $log.error("missing irodsAbsolutePath")
                MessageService.danger("missing irodsAbsolutePath");
            }


            $location.url("/profile/");
            $location.search("path", irodsAbsolutePath);

        }

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
                        fields: {collectionParentName: $scope.collectionListingInSubcol.pagingAwareCollectionListingDescriptor.parentAbsolutePath},
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $log.info(progressPercentage);

                    }).then(function (data) {
                        $scope.collectionListingInSubcol = data;
                        $scope.pop_up_close();
                        $scope.files_to_upload = [];
                        $scope.files_name = [];
                    });
                }
            }
            $route.reload();
        };



    }])

    .filter('myFilter', function() {
        return function(items, begin, end) {

            return items.slice( begin, end);
        }
    })

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
