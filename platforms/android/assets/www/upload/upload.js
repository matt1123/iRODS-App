'use strict';

angular.module('upload', ['ngRoute','ngFileUpload'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/upload', {
            templateUrl: 'upload/upload.html',
            controller: 'uploadCtrl',

        });
    }])

    .controller('uploadCtrl', ['$scope', '$log', 'Upload', 'globals', function ($scope, $log, Upload, $globals) {


        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });

        $scope.multiple = true;
        $scope.files_to_upload = [];
        $scope.files_name = [];
        $scope.copy_source = "";
        $scope.copy_target = "";


        /* Cesar's Code */
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
                        fields: {collectionParentName: '/dfc1/home/test1/'},
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $log.info(progressPercentage);
                    }).success(function (data, status, headers, config) {
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                        $scope.pop_up_close();
                    });
                }
            }
        };

        /* End Cesar's Code */



        /* Stack Overflow Code */

        $scope.onFileSelect = function($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var $file = $files[i];
                Upload.upload({
                    url: $globals.backendUrl('file'),
                    fields: {collectionParentName: '/root?path=%2FtempZone%2Fhome%2Fdanb'},
                    file: $file,
                    progress: function(e){}
                }).then(function(data, status, headers, config) {
                    // file is uploaded successfully
                    console.log(data);
                });
            }
        }






        /*
        $scope.upload = function(files) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    Upload.upload({
                        url: $globals.backendUrl('file'),
                        fields: {collectionParentName: '/Starred%20Files?offset=0&path='},
                        file: file
                    })
                }
            }
        }
        */


    }])