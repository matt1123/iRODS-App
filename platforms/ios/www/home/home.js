'use strict';

angular.module('home', ['ngRoute'])

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



    .controller('homeCtrl', ['$scope',  '$log', '$http', '$location', 'globals', 'virtualCollectionsService', function ($scope, $log, $http, $location, $globals, $virtualCollectionsService) {



        $scope.listVirtualCollections = function (irods) {

            $log.info("getting starred collection");

            return $http({method: 'GET', url: $globals.backendUrl('collection/Starred%20Files?offset=0&path=')}).success(function (data) {
                $scope.collectionListing = data;
            }).error(function () {
                $scope.collectionListing = [];
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
        }

        $scope.selectProfile = function (irodsAbsolutePath) {
            $log.info("going to Data Profile");
            if (!irodsAbsolutePath) {
                $log.error("missing irodsAbsolutePath")
                MessageService.danger("missing irodsAbsolutePath");
            }


            $location.url("/profile/");
            $location.search("path", irodsAbsolutePath);

        }

        $scope.appTitle = "Mobile App";

        //File Actions
        $scope.getDownloadLink = function() {
            return  $globals.backendUrl('download') + "?path=" + $scope.dataProfile.domainObject.absolutePath;

        };

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

        $scope.delete_action = function (){
            var delete_paths = 'path='+ $scope.dataProfile.parentPath + "/" +$scope.dataProfile.childName;
            $log.info('Deleting:'+delete_paths);
            return $http({
                method: 'DELETE',
                url: $globals.backendUrl('file') + '?' + delete_paths
            }).success(function (data) {
                alert('Deletion completed');
                window.history.go(-1);
            })
        };

        $scope.rename_pop_up_open = function() {
            $('.deleter').fadeOut(100);
            $('.pop_up_window').fadeIn(100);
            $('.renamer').fadeIn(100);
            var name_of_selection = $('.ui-selected').children('.list_content').children('.data_object').text();
            $('.selected_object').append(name_of_selection);
        };

        $scope.rename_action = function (){
            var rename_path = $scope.dataProfile.parentPath + "/" + $scope.dataProfile.childName;
            var new_name = $('#new_renaming_name').val();
            var old_url = window.location;
            var n = String(old_url).lastIndexOf("%2F");
            var new_url = String(old_url).substr(0,n);
            var new_url = new_url + "%2F" + new_name;
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
