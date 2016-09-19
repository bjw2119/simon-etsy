'use strict';

simon.factory('EtsyFactory', function ($http) {
    let EtsyFactoryObj = {};
    let shopUrlBase = 'https://openapi.etsy.com/v2/shops/';
    let listingsUrlBase = 'listings/active.js';
    let apiKey = 'h2e7qbewfwmq0cmh2lefa5kg';


    EtsyFactoryObj.getListingsAuto = function (stores) {
        let storePromises = stores.map(function (store) {
            let etsyResponse = {};
            //Fetch listings for each store, limited to the 5 highest scoring
            return $http({
                url: shopUrlBase + store + '/' + listingsUrlBase,
                method: "JSONP",
                params: { api_key: apiKey, sort_on: 'score', limit: 5, callback: 'JSON_CALLBACK' }
            })
                .success(function (data) {
                    etsyResponse.status = "Success";
                    etsyResponse.data = data;
                })
                .error(function (data) {
                    etsyResponse.status = "Failed";
                    etsyResponse.data = data;
                })
        })
        return Promise.all(storePromises).then(stores => {
            return stores.map(function (store) {
                return { store: store.data.params.shop_id, listings: store.data.results }
            })

        });
    };

    EtsyFactoryObj.getListingsCustom = function (stores) {
        let storePromises = stores.map(function (store) {

            let etsyResponse = {};
            //Fetch listings for each store via JSONP query with no limit or sorting
            return $http({
                url: shopUrlBase + store + '/' + listingsUrlBase,
                method: "JSONP",
                params: { api_key: apiKey, callback: 'JSON_CALLBACK' }
            })
                .success(function (data) {
                    etsyResponse.status = "Success";
                    etsyResponse.data = data;
                })
                .error(function (data) {
                    etsyResponse.status = "Failed";
                    etsyResponse.data = data;
                })
        })
        return Promise.all(storePromises).then(stores => {

            //Go through each store...
            stores.forEach(function (store) {

                //...to add a popularity field to each listing by multiplying the % of favorites by the log of views
                store.data.results.forEach(function (result) {
                    if (result.views == 0) result.popularity = 0;
                    else result.popularity = (result.num_favorers / result.views) * Math.log(result.views);
                })

                //Then sort by popularity
                store.data.results.sort(function (a, b) {
                    return b.popularity - a.popularity;
                })

                //And finally remove all but the five most popular
                store.data.topFive = store.data.results.slice(0, 5);
            })

            return stores.map(function (store) {
                return { store: store.data.params.shop_id, listings: store.data.topFive }
            })

        });
    };

    return EtsyFactoryObj;
});