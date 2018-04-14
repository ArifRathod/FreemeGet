var app = angular.module('routerApp');
app.controller('registerController', function($scope,$http,$localStorage,$location) {

	//BUTTON SIGN In CLICK
	$scope.btnSignInClick = function(){
		var obj = {
			"firstName":$scope.firstName,
			"lastName":$scope.lastName,
			"email":$scope.email,
			"phone":$scope.phone,
			"gender":$scope.gender,
			"password":$scope.password
		};

		$http.post("/signup",obj).success(function(data, status) {
            console.log(data);
			if(data && data.status){
				alert("Successfully logged In");
				$location.path("/login");
				// $localStorage["userData"] = data;
			}else{
				alert(data.message)
			}
        });
	}    
});