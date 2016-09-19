'user strict';

var simon = angular.module('simon', []);

simon.controller('MainCtrl', function($scope, EtsyFactory){
    $scope.shops;
    $scope.auto = true;
    $scope.search = function(){
        let stores = $scope.shops.split(' ');
        if($scope.auto) {
            EtsyFactory.getListingsAuto(stores)
            .then(results=> {
                $scope.stores = results;
                $scope.$digest()
            })
            .catch(err=>console.log(err));
        }
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