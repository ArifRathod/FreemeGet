var app = angular.module('routerApp');
app.controller('loginController', function($scope,$http,$localStorage,$location) {
	console.log("login controller")
	$scope.btnSignInClick = function(){
		var obj = {
			"email":$scope.email,
			"password":$scope.password
		};
		$http.post("/login",obj).success(function(data, status) {
			if(data && data.status){
				alert("successfully login");
				$localStorage["User"] = data.data;
				$location.path("/#/home");
			}else{
				alert("User not Exist");
			}
            console.log(data.data);
            // $scope.userlist = data.data;
        });
	}
    // $scope.init = function(){
    //     $http.post("/getUsers").success(function(data, status) {
    //         console.log(data.data);
    //         $scope.userlist = data.data;
    //     });
    // }
    // $scope.init();
    
});