'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'home',
    'login',
    'subCol',
    'upload',
    'profile',
    'ngFileUpload',
    'MessageCenter',
    'globalsModule',
    'httpInterceptorModule',
    'fileModule',
    'ngCordova',
])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/home'});
    }]).config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.withCredentials = true;
    }]);



angular.module('globalsModule', [])
    .factory('globals', function ($rootScope) {

        var f = {};

        /*
         NB put the trailing slash in the HOST variable!
         */

        //var HOST = "https://dfcweb.datafed.org/irods-cloud-backend/";
        var HOST = "http://localhost:8080/irods-cloud-backend/";
        // var HOST = "/irods-cloud-backend/";
        f.backendUrl = function(relativeUrl) {
            return HOST + relativeUrl;
        };


        /**
         * Saved path in case an auth exception required a new login
         * @type {null}
         */
        f.lastPath = null;
        f.loggedInIdentity = null;



        /**
         * Saved path when a not authenticated occurred
         * @param newLastPath
         */
        f.setLastPath = function (newLastPath) {
            this.lastPath = newLastPath;
        };


        /**
         * Retrieve a path to re-route when a login screen was required
         * @returns {null|*|f.lastPath}
         */
        f.getLastPath = function () {
            return this.lastPath;
        };

        /**
         * Retrieve the user identity, server info, and options for the session
         * @returns {null|*}
         */
        f.getLoggedInIdentity = function() {
            return this.loggedInIdentity;
        }

        /**
         * Set the user identity, server info, and options for the session
         * @param inputIdentity
         */
        f.setLoggedInIdentity = function(inputIdentity) {
            this.loggedInIdentity = inputIdentity;
        }

        return f;

    })
    .factory('breadcrumbsService', function ($rootScope, $log) {

        var bc = {};

        /**
         * Global representation of current file path for display
         */
        bc.currentAbsolutePath = null;
        bc.pathComponents = [];


        /**
         * Set the current iRODS path and split into components for use in breadcrumbs
         * @param pathIn
         */
        bc.setCurrentAbsolutePath = function (pathIn) {

            if (!pathIn) {
                this.clear();
                return;
            }

            this.currentAbsolutePath = pathIn;
            $log.info("path:" + pathIn);
            this.pathComponents = this.pathToArray(pathIn);
            $log.info("path components set:" + this.pathComponents);

        }

        /**
         * Turn a path into
         * @param pathIn
         * @returns {*}
         */
        bc.pathToArray = function (pathIn) {
            if (!pathIn) {
                $log.info("no pathin");
                return [];
            }

            var array = pathIn.split("/");
            $log.info("array orig is:" + array);
            // first element may be blank because it's the root, so it'll be trimmed from the front

            if (array.length == 0) {
                return [];
            }

            array.shift();
            return array;

        }

        /**
         * given an index into the breadcrumbs, roll back and build an absolute path based on each element in the
         * bread crumbs array
         * @param index int wiht the index in the breadcrumbs that is the last part of the selected path
         * @returns {string}
         */
        bc.buildPathUpToIndex = function (index) {

            var path = this.getWholePathComponents();

            if (!path) {
                $log.error("no path components, cannot go to breadcrumb");
                throw("cannot build path");
            }

            var totalPath = "";

            for (var i = 0; i <= index; i++) {

                // skip a blank path, which indicates an element that is a '/' for root, avoid double slashes
                if (path[i]) {

                    totalPath = totalPath + "/" + path[i];
                }
            }

            $log.info("got total path:" + totalPath);
            return totalPath;


        }

        /**
         * Get all of the path components
         * @returns {*}
         */
        bc.getWholePathComponents = function () {

            if (!this.pathComponents) {
                return [];
            } else {
                return this.pathComponents;
            }

        }


        /**
         * Reset path data
         */
        bc.clear = function () {
            this.currentAbsolutePath = null;
            this.pathComponents = [];
        }

        return bc;

    });


angular.module('fileModule',[])
    .factory('fileService', ['$http', '$log', '$q','globals',function ($http, $log, $q, globals) {


        var dataProfile = {};

        return {

            /**
             * retrieve a basic profile of a data object with various complex properties pre-wired
             * @param absolutePath
             */
            retrieveDataProfile: function (absolutePath) {
                $log.info("retriveDataProfile()");
                if (!absolutePath) {
                    $log.error("absolutePath is missing");
                    throw "absolutePath is missing";
                }

                var deferred = $q.defer();

                var promise =  $http({method: 'GET', url: globals.backendUrl('file') , params: {path: absolutePath}}).success(function(data, status, headers, config) {

                    deferred.resolve(data);
                    // decorate data with tag string
                    $log.info("return from call to get fileBasics:" + data);
                    // data.tagString = tagService.tagListToTagString(data.irodsTagValues);


                }).error(function () {
                    return null;
                });

                return deferred.promise;

            },

            /**
             * Given a path, set the 'star' value to true.  This is idempotent and will silently ignore an already starred file
             * @param absolutePath String with the absolute path to the irods file or collection to be starred
             *
             * note: to call
             *
             *  // Call the async method and then do stuff with what is returned inside our own then function
             * myService.async().then(function(d) {
         *    $scope.data = d;
         *  });
             *
             *fileService.starFileOrFolder(absPath).then(function(d) {
         *    // I do cool stuff
         *  });
             *
             */

            starFileOrFolder: function(absolutePath) {
                $log.info("starFileOrFolder()");
                if (!absolutePath) {
                    $log.error("absolutePath is missing");
                    throw "absolutePath is missing";
                }

                var promise =  $http({method: 'PUT', url: globals.backendUrl('star') , params: {path: absolutePath}}).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    $log.info(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data;
                });
                // Return the promise to the controller
                return promise;
            },


            /**
             * Given a path, remove a star value.  This is idempotent and will silently ignore an already unstarred file
             * @param absolutePath  String with the absolute path to the irods file or collection to be unstarred
             * @returns {*}
             */
            unstarFileOrFolder: function(absolutePath) {
                $log.info("unstarFileOrFolder()");
                if (!absolutePath) {
                    $log.error("absolutePath is missing");
                    throw "absolutePath is missing";
                }

                var promise =  $http({method: 'DELETE', url: globals.backendUrl('star') , params: {path: absolutePath}}).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    $log(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data;
                });
                // Return the promise to the controller
                return promise;
            },

            /**
             * Move a file or folder from source to target, or move the source to the specified resource
             * @param sourcePath irodsPath to source
             * @param targetPath irodsPath to target
             * @param targetResource blank if not used, resource for target
             * @returns JSON representation of CollectionAndDataObjectListingEntry for target of copy
             */
            moveFileOrFolder: function(sourcePath, targetPath, targetResource) {
                $log.info("move()");

                if (!sourcePath) {
                    $log.error("sourcePath is missing");
                    throw "sourcePath is missing";
                }

                if (!targetPath) {
                    targetPath = "";
                }

                if (!targetResource) {
                    targetResource = "";
                }


                var promise =  $http({method: 'POST', url: globals.backendUrl('move') , params: {sourcePath: sourcePath, targetPath: targetPath, resource: targetResource}}).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    $log(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data; // return CollectionAndDataObjectListingEntry as JSON
                });
                // Return the promise to the controller
                return promise;

            },


            /**
             * Copy a file or folder from source to target
             * @param sourcePath irodsPath to source
             * @param targetPath irodsPath to target
             * @param targetResource blank if not used, resource for target
             * @param overwrite boolean if force is required
             * @returns JSON representation of CollectionAndDataObjectListingEntry for target of copy
             */
            copyFileOrFolder: function(sourcePath, targetPath, targetResource, overwrite) {
                $log.info("copy()");

                if (!sourcePath) {
                    $log.error("sourcePath is missing");
                    throw "sourcePath is missing";
                }

                if (!targetPath) {
                    $log.error("targetPath is missing");
                    throw "targetPath is missing";
                }

                if (!targetResource) {
                    targetResource = "";
                }

                if (!overwrite) {
                    overwrite = false;
                }

                var promise =  $http({method: 'POST', url: globals.backendUrl('copy') , params: {sourcePath: sourcePath, targetPath: targetPath, resource: targetResource, overwrite:overwrite}}).then(function (response) {
                    // The then function here is an opportunity to modify the response
                    $log(response);
                    // The return value gets picked up by the then in the controller.
                    return response.data; // return CollectionAndDataObjectListingEntry as JSON
                });
                // Return the promise to the controller
                return promise;

            }
        };

    }]);