'user strict';

var simon = angular.module('simon', []);

simon.controller('MainCtrl', function($scope, EtsyFactory){
    //Input of list of stores to query
    $scope.shops;

    //Queries Etsy API and adds results to tables
    $scope.search = function(){
        let stores = $scope.shops.split(' ');
        
        //Call factory method to query API and calculate term frequencies
        EtsyFactory.getTerms(stores)
            .then(results=> {
                $scope.stores = results;
                $scope.$digest()
            })
            .catch(err=>console.log(err));
    }
})