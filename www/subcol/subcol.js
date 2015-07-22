'use strict';

angular.module('subcol', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/subcol', {
            templateUrl: 'subcol/subcol.html',
            controller: 'subcolCtrl'
        });
    }])

