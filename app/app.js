var myApp = angular.module('calcuload', ['ui.router', 'ui.bootstrap']);

myApp.config(function ($stateProvider, $locationProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');
    $stateProvider
            .state('/admin', {
                url: '/admin',
                templateUrl: 'templates/admin.html',
                controller: 'admin_controller',
                controllerAs: "std_ctrl",
              
                resolve: {
                    'title': ['$rootScope', function ($rootScope) {
                            $rootScope.title = "LOAD CALCULATOR APP";
                        }]
                }

            }).state('/', {
                url: '/',
                templateUrl: 'templates/guest.html',
                controller: 'guest_controller',
                controllerAs: "guest_ctrl",
              
                resolve: {
                    'title': ['$rootScope', function ($rootScope) {
                            $rootScope.title = "LOAD CALCULATOR APP";
                        }]
                }

            }).state('/calculator', {
                url: '/calculator',
                templateUrl: 'templates/calculator.html',
                controller: 'calc_controller',
                controllerAs: "calc_ctrl",
              
                resolve: {
                    'title': ['$rootScope', function ($rootScope) {
                            $rootScope.title = "LOAD CALCULATOR APP";
                        }]
                }

            }).state('/posts', {
                url: '/posts',
                templateUrl: 'templates/posts.html',
                controller: 'post_controller',
                controllerAs: "post_ctrl",
              
                resolve: {
                    'title': ['$rootScope', function ($rootScope) {
                            $rootScope.title = "LOAD CALCULATOR APP";
                        }]
                }

            })
            
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });




});

