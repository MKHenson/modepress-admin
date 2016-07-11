﻿module clientAdmin
{
	'use strict';

    /**
     * A custom interface using our additional variables
     */
    interface CustomState extends ng.ui.IState
    {
        authenticate?: boolean;
    }

	/**
	* Configures the Angular application
	*/
	export class Config
	{
		// $inject annotation.
		public static $inject = [
            "$urlRouterProvider",
            "$stateProvider",
            "$locationProvider",
            "$httpProvider",
            "cfpLoadingBarProvider"
		];

		/**
		* Creates an instance of the configurator
		*/
        constructor(routeProvider: angular.ui.IUrlRouterProvider, stateProvider: angular.ui.IStateProvider, $locationProvider: angular.ILocationProvider, $httpProvider: angular.IHttpProvider, cfpLoadingBarProvider)
		{
            $locationProvider.html5Mode(true);

            // Turn off the loading bar spinner
            cfpLoadingBarProvider.includeSpinner = false;

            // Allows us to use CORS with angular
            $httpProvider.defaults.withCredentials = true;

            // When we go to logout - it redirects us back to the login screen after its task is complete
            routeProvider.when("/logout", ["$state", "Authenticator", function(state: ng.ui.IStateService, auth: Authenticator)
            {
                return auth.logout().then(function (val)
                {
                    state.go("login");
                });
            }]);

            // If the path doesn't match any of the urls go to the default state
            routeProvider.otherwise(function ($injector, $location)
            {
                var $state = $injector.get("$state");
                $state.go("default");
            });

            // Setup the different states
			stateProvider
                .state("default", <CustomState>{
                    views: {
                        "main-view": {
                            templateUrl: "states/default/dashboard.html",
                            "controller": ["$scope", function ($scope)
                            {
                                var dashLinks = [];
                                for (var i = 0, l = _plugins.length; i < l; i++)
                                    dashLinks = dashLinks.concat(_plugins[i].dashboardLinks);

                                $scope.dashLinks = dashLinks;
                            }]
                        }
                    },
                    url: "/",
                    authenticate: true
                })
                .state('default.seo', <CustomState>{
                    templateUrl: 'states/seo/dash-seo.html',
                    url: 'seo',
                    authenticate: true,
                    controller: "seoCtrl",
                    controllerAs: "controller"
                })
                .state('default.media', <CustomState>{
                    templateUrl: 'states/media/dash-media.html',
                    url: 'media',
                    authenticate: true,
                    controller: "mediaCtrl",
                    controllerAs: "mediaController"
                })
                .state('default.users', <CustomState>{
                    templateUrl: 'states/users/dash-users.html',
                    url: 'users',
                    authenticate: true,
                    controller: "usersCtrl",
                    controllerAs: "controller"
                })
                .state('default.posts', <CustomState>{
                    templateUrl: 'states/posts/dash-posts.html',
                    url: 'posts',
                    authenticate: true,
                    controller: "postsCtrl",
                    controllerAs: "controller",
                    onExit: function()
                    {
                        tinymce.remove("textarea");
                    },
                    resolve: {
                         curCategories: ["categories", function (categories: ModepressClientPlugin.CategoryService) {
                            return categories.all();
                        }]
                    }
                })
                .state("login", <CustomState>{
					views: {
						"main-view": {
                            templateUrl: "states/login/log-in.html",
							controller: "loginCtrl",
							controllerAs: "controller"
						}
					},
                    url: '/login',
                    authenticate: false
                })
				.state("register", <CustomState>{
					views: {
						"main-view": {
                            templateUrl: "states/register/register.html",
                            controller: "registerCtrl",
							controllerAs: "controller"
						}
                    },
					onExit: function ()
					{
						Recaptcha.destroy();
					},
                    url: '/register',
                    authenticate: false
				})
				.state("message", <CustomState> {
					views: {
						"main-view": {
                            templateUrl: "states/message/message.html",
                            controller: ["$scope", "$stateParams", function ($scope, $stateParams )
							{
								// Decodes the html
                                var txtbox = document.createElement("textarea");
                                txtbox.innerHTML = $stateParams.message;
                                $scope.message = txtbox.value;

                                txtbox.innerHTML = $stateParams.origin;
                                $scope.origin = txtbox.value;

                                $scope.error = ($stateParams.status == "error" ? true : false );
							}]
						}
					},
                    url: "/message?message&status&origin"
                })
                .state("password-rest", <CustomState> {
                        views: {
                            "main-view": {
                                templateUrl: "states/password-reset/password-reset.html",
                                controllerAs: "controller",
                                controller: "passwordCtrl"
                            }
                        },
                        url: "/password-reset-form?key&user&origin"
                })

            for (var i = 0, l = _plugins.length; i < l; i++)
                _plugins[i].onStatesInit(stateProvider);
		}
	}
}