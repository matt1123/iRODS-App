/**
 * Created by matthewkrause on 7/17/15.
 */
angular.module('buttonMod', [])
    .controller('buttonCtrl', ['$scope', function($scope) {
        $scope.goHome = function(){
            $location.path="/home/home"
        };

        /*
         * Function to go to homepage
         */
        f.goHome = function () {
            // $location.path("/home/home");
            $window.alert("I am an alert box!");

        }
    }]);