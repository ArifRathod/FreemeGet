var app = angular.module('routerApp');
app.controller('homeController', function($scope,$http) {

    $scope.init = function(){
        $http.post("/getUsers").success(function(data, status) {
            console.log(data.data);
            $scope.userlist = data.data;
        });
    }
    $scope.init();
    
});