var routerApp = angular.module('routerApp', ['ui.router','ngStorage']);

routerApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
        
        .state('login', {
            url: '/login',
            templateUrl: 'login.html',
            controller: 'loginController'
        })

        .state('register', {
            url: '/register',
            templateUrl: 'register.html',
            controller: 'registerController'
        })
        
        .state('home', {
            url: '/home',
            templateUrl: 'partial/home.html',
            controller: 'homeController'
        })

        .state('orders', {
            url: '/orders',
            templateUrl: 'partial/orders.html',
            controller: 'ordersController'
        })
        .state('products', {
            url: '/products',
            templateUrl: 'partial/products.html',
            controller: 'productsController'
        })
        .state('users', {
            url: '/users',
            templateUrl: 'partial/users.html',
            controller: 'usersController'
        })
        .state('reports', {
            url: '/reports',
            templateUrl: 'partial/reports.html',
            controller: 'reportsController'
        })
        .state('promotionalemail', {
            url: '/promotionalemail',
            templateUrl: 'partial/promotionalemail.html',
            controller: 'promotionalemailController'
        })
        
});

routerApp.controller('mainController', function($scope,$localStorage,$rootScope) {

    console.log($localStorage.User)
    $rootScope.User = $localStorage.User;
    
});