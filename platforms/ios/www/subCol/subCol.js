'use strict';

angular.module('subCol', ['ngRoute'])

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

    .controller('subColCtrl', ['$scope',  '$log', '$http', '$location', 'globals', function ($scope, $log, $http, $location, $globals) {

        $scope.listVirtualCollections = function () {

            var url = $location.url();
            url = url.substring(8);

            return $http({method: 'GET', url: $globals.backendUrl("collection/Starred%20Files?offset=0&" + url)}).success(function (data) {
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
