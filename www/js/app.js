'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'home',
    'upload',
    'profile',
    'subcol',
    'login',
    'ngRoute',
    'httpInterceptorModule',
    'MessageCenter',
    'globalsModule',

]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/home'});
    }]).config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.withCredentials = true;
    }]);

