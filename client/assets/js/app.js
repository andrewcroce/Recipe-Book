(function() {
  'use strict';

  angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations',

    //Firebase
    'firebase',

    //Autocomplete
    'angucomplete'
  ])
    .controller('RecipesController', recipesController)
    .controller('RecipeController', recipeController)
    .controller('EditRecipeController', editRecipeController)
    .controller('NewRecipeController', newRecipeController)

    .config(config)
    .run(run)

    .filter('SplitTextByLines', splitTextByLines)
    .directive('autoExpandHeight', autoExpandHeight)
  ;

  recipesController.$inject = ['$scope', '$location', '$stateParams', '$state', '$controller', '$firebaseArray'];
  recipeController.$inject = ['$scope', '$stateParams', '$state', '$controller', '$firebaseObject'];
  editRecipeController.$inject = ['$scope', '$location', '$stateParams', '$state', '$controller', '$firebaseObject'];
  newRecipeController.$inject = ['$scope', '$location', '$stateParams', '$state', '$controller', '$firebaseArray'];

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
  }

  function run() {
    FastClick.attach(document.body);
  }



  // RECIPES CONTROLLER
  function recipesController($scope, $location, $stateParams, $state, $controller, $firebaseArray) {
    
    // Extend the default controller
    angular.extend(this, $controller('DefaultController', {$scope: $scope, $stateParams: $stateParams, $state: $state}));

    var ref = new Firebase("https://ac-recipe-book.firebaseio.com/recipes");
    $scope.recipes = $firebaseArray(ref);

    $scope.page = {
      'title' : "Recipes"
    }

    $scope.$watch('selectedRecipe', function( newVal, oldVal ){
      if( typeof( newVal ) != 'undefined' && newVal != null) {
        var id = newVal.originalObject.$id;
        if( id ){
          $location.path('/recipe/' + id);
        }
      }
    });

  }



  function recipeController($scope, $stateParams, $state, $controller, $firebaseObject){
    // Extend the default controller
    angular.extend(this, $controller('DefaultController', {$scope: $scope, $stateParams: $stateParams, $state: $state}));

    var ref = new Firebase("https://ac-recipe-book.firebaseio.com/recipes/"+$stateParams.id);
    var syncObject = $firebaseObject(ref);

    syncObject.$bindTo($scope, "recipe");
  }





  function editRecipeController($scope, $location, $stateParams, $state, $controller, $firebaseObject){
    // Extend the default controller
    angular.extend(this, $controller('DefaultController', {$scope: $scope, $stateParams: $stateParams, $state: $state}));

    var ref = new Firebase("https://ac-recipe-book.firebaseio.com/recipes/"+$stateParams.id);
    var syncObject = $firebaseObject(ref);

    syncObject.$bindTo($scope, "recipe").then(function(){
      if( !$scope.recipe.ingredients.length ) {
        $scope.recipe.ingredients = {
          name: "",
          ingredients: [{ key: 0, quantity: "", name: "" }],
          instructions: ""
        }
      }
    });

    $scope.addIngredient = function(){
      var nextKey = $scope.recipe.ingredients.length;
      console.log('adding '+nextKey);
       $scope.recipe.ingredients.push({
        key: nextKey,
        quantity: "", 
        name: ""
      });
    }

    $scope.removeIngredient = function( key ){
      var index = $scope.recipe.ingredients.map(function(e){
        return e.key;
      }).indexOf(key);
      $scope.recipe.ingredients.splice(index, 1);
    }

    $scope.doneEditing = function(){
      $location.path('/recipe/' + $scope.recipe.$id);
    }
  }





  function newRecipeController($scope, $location, $stateParams, $state, $controller, $firebaseArray){

    // Extend the default controller
    angular.extend(this, $controller('DefaultController', {$scope: $scope, $stateParams: $stateParams, $state: $state}));
    
    var ref = new Firebase("https://ac-recipe-book.firebaseio.com/recipes");
    $scope.recipes = $firebaseArray(ref);

    $scope.newRecipe = {
      name: "",
      yield: "",
      ingredients: [{ key: 0, quantity: "", name: "" }],
      instructions: ""
    };

    $scope.page = {
      'title' : "New Recipe"
    };

    $scope.ingredientLines = [
      { key: 0, quantity: "", name: "" },
      { key: 1, quantity: "", name: "" },
      { key: 2, quantity: "", name: "" }
    ];

    $scope.addIngredient = function(){
      var nextKey = $scope.ingredientLines.length;
      $scope.ingredientLines.push({
        key: nextKey,
        quantity: "", 
        name: ""
      });
    }

    $scope.removeIngredient = function( key ){
      var index = $scope.ingredientLines.map(function(e){
        return e.key;
      }).indexOf(key);
      $scope.ingredientLines.splice(index, 1);
    }

    $scope.addRecipe = function(){
      $scope.recipes.$add({
        name: $scope.newRecipe.name,
        yield: $scope.newRecipe.yield,
        ingredients: $scope.newRecipe.ingredients,
        instructions: $scope.newRecipe.instructions
      }).then(function(response){
        var id = response.key();
        $location.path('/recipe/' + id);
      });
    }
  }


  // Split text by line filter
  function splitTextByLines(){
    return function( text ){
      text = String( text ).trim();
      return text.split('\n');
    }
  }


  // Auto expand height
  function autoExpandHeight(){
    return {
      restrict: 'A',
      link: function( $scope, elem, attrs ){
        elem.bind('keyup', function($event) {

          var scrollLeft = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft;
          var scrollTop  = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
   
          elem.css({height: 0+"px"})
          var height = elem[0].scrollHeight;

          // 8 is for the padding
          if (height < 20) {
              height = 28;
          }
          elem.css({height: height+"px"});
          window.scrollTo(scrollLeft, scrollTop);
        });

        // Expand the textarea as soon as it is added to the DOM
        setTimeout( function() {

          var scrollLeft = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft;
          var scrollTop  = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
   
          elem.css({height: 0+"px"})
          var height = elem[0].scrollHeight;

          // 8 is for the padding
          if (height < 20) {
              height = 28;
          }

          elem.css({height: height+"px"});
          window.scrollTo(scrollLeft, scrollTop);

        }, 1000)
      }
    };
  }



})();
