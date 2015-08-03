'use strict';

angular.module('upload', ['ngRoute','ngFileUpload'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/upload', {
            templateUrl: 'upload/upload.html',
            controller: 'uploadCtrl',

        });
    }])


    .controller('uploadCtrl', ['$scope', 'Upload', 'globals', function ($scope, Upload, $globals) {


        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });

        $scope.multiple = true;
        $scope.upload = function (files) {
            if (files && files.length) {
                $(".upload_container").css('display','none');
                $(".upload_container_result").css('display','block');

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    $(".upload_container_result ul").append('<li id="uploading_item_'+i+'" class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/data_object_icon.png">'+file.name+'</div></li>');

                    Upload.upload({
                        url: $globals.backendUrl('file') , /* collection/Starred%20Files?offset=0&path= */
                        fields:{collectionParentName: '/Starred%20Files?offset=0&path='},
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $log.info(progressPercentage);
                    }).success(function (data, status, headers, config) {
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    });
                }
            }
        };

    }])





























/*'use strict';

angular.module('upload', ['ngRoute'/*,'ngFileUpload'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/upload', {
            templateUrl: 'upload/upload.html',
            controller: 'uploadCtrl',

        });
    }])

    .controller('uploadCtrl', ['$scope', 'Upload', 'globals', function ($scope, Upload, $globals) {


        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });

        $scope.multiple = true;
        $scope.upload = function (files) {
            if (files && files.length) {
                $(".upload_container").css('display','none');
                $(".upload_container_result").css('display','block');

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    $(".upload_container_result ul").append('<li id="uploading_item_'+i+'" class="light_back_option_even"><div class="col-xs-7 list_content"><img src="images/data_object_icon.png">'+file.name+'</div></li>');

                    Upload.upload({
                        url: $globals.backendUrl('file') , /* collection/Starred%20Files?offset=0&path=
                        fields:{collectionParentName: 'collection/Starred%20Files?offset=0&path='},
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $log.info(progressPercentage);
                    }).success(function (data, status, headers, config) {
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    });
                }
            }
        };

    }])*/