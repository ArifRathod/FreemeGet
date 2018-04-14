var app = angular.module('routerApp');
app.controller('usersController', function($scope,$http) {
	console.log("This is users controller")
    $scope.init = function(){
        $http.post("/getUsers").success(function(data, status) {
            console.log(data.data);
            $scope.userlist = data.data;
        });
    }
    $scope.init();
    
});