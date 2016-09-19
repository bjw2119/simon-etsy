'user strict';

var simon = angular.module('simon', []);

simon.controller('MainCtrl', function($scope, EtsyFactory){
    //Input of list of stores to query
    $scope.shops;

    //Determines if Etsy score or popularity algorithm is to be used
    $scope.auto = true;

    //Queries Etsy API and adds results to tables
    $scope.search = function(){
        let stores = $scope.shops.split(' ');

        //Etsy score sorting
        if($scope.auto) {
            EtsyFactory.getListingsAuto(stores)
            .then(results=> {
                $scope.stores = results;
                $scope.$digest()
            })
            .catch(err=>console.log(err));
        }
        //Custom algorithm sorting
        else {
            EtsyFactory.getListingsCustom(stores)
            .then(results=> {
                $scope.stores = results;
                $scope.$digest()
            })
            .catch(err=>console.log(err));
        }
    }
})