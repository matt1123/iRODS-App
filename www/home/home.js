'use strict';

angular.module('home', ['ngRoute'/*, 'ngFileUpload'*/])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'home/home.html',
            controller: 'homeCtrl',
            resolve: {



            }
        }).when('/home', {
            templateUrl: 'home/home.html',
            controller: 'homeCtrl',
            resolve: {
              

            }
        });
    }])


    .controller('homeCtrl', ['$scope',  '$log', '$http', '$location', 'globals', function ($scope, $log, $http, $location, $globals, breadcrumbsService) {



    }])

;
