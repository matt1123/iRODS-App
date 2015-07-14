'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.login',
    'ngRoute',
    'httpInterceptorModule',
    'MessageCenter',
    'globalsModule'

]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/login'}); 
}]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
}]);