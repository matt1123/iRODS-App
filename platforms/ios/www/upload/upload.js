'use strict';

angular.module('upload', ['ngRoute','ngFileUpload'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/upload', {
            templateUrl: 'upload/upload.html',
            controller: 'uploadCtrl',

        });
    }])

    //--------Camera--------

    .directive('camera', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                elm.on('click', function() {
                    navigator.camera.getPicture(function (imageURI) {
                        scope.$apply(function() {
                            ctrl.$setViewValue(imageURI);
                        });
                    }, function (err) {
                        ctrl.$setValidity('error', false);
                    }, { quality: 50, destinationType: Camera.DestinationType.FILE_URI }
                    )});
            }
        };
    })

    .controller('uploadCtrl', ['$scope', 'Upload', 'globals', function ($scope, Upload, $globals) {


        //--------Camera--------

        $scope.myPictures = [];
        $scope.$watch('myPicture', function(value) {
            if(value) {
                myPictures.push(value);
            }
        }, true);

        //--------Camera--------

        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });

        $scope.multiple = true;

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


    }])