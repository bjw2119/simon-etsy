'use strict';

simon.factory('EtsyFactory', function ($http) {
    let EtsyFactoryObj = {};
    let shopUrlBase = 'https://openapi.etsy.com/v2/shops/';
    let listingsUrlBase = 'listings/active.js';
    let apiKey = 'h2e7qbewfwmq0cmh2lefa5kg';

    EtsyFactoryObj.getTerms = function (stores) {

        //Define words or fragments that should not be considered meaningful to be used in purgeText
        let garbage = ['the', '39', 'a', 'and', 'it', 'an', 'quot', 'is', 'in', 'http', 'com', 'www', 'to', 'for', 'of', 'this'];

        //Helper func to combine text from different listings into large arrays and LowerCased
        let transformText = (text, master) => master.concat(text.toLowerCase().split(/\W/));

        //Helper func to purge empty strings and unwanted words and fragments
        let purgeText = (text) => text.filter(w => garbage.indexOf(w) == -1 && Boolean(w));

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

        return Promise.all(storePromises)
        .then(stores => {

            //Go through each store...
            stores = stores.map(function (store) {
                let masterTitle = [];
                let masterDescription = [];
                let storeDict = {};
                //...to gather all descriptive text from listings
                store.data.results.forEach(function (result) {
                    masterTitle = transformText(result.title, masterTitle)
                    masterDescription = transformText(result.description, masterDescription);
                });

                //Purge all undesired fragments and words
                masterTitle = purgeText(masterTitle)
                masterDescription = purgeText(masterDescription)


                //Counters for top 5 words
                let topFive = {};
                let fifth = "";

                //Set max iterations
                let longer = masterDescription.length > masterTitle.length ? masterDescription.length : masterTitle.length;
                console.log("Length: ", longer);
                for (let i = 0; i < longer; i++) {
                    if (masterTitle[i]) {
                        if (!storeDict[masterTitle[i]]) storeDict[masterTitle[i]] = 1;
                        else storeDict[masterTitle[i]] += 1;
                    }
                    if (masterDescription[i]) {
                        if (!storeDict[masterDescription[i]]) storeDict[masterDescription[i]] = 1;
                        else storeDict[masterDescription[i]] += 1;
                    }

                //Check if words are in top 5 and recalculate smallest top 5 if necessary
                    if (!topFive[fifth] || topFive[fifth] < storeDict[masterTitle[i]]) {
                        topFive[masterTitle[i]] = storeDict[masterTitle[i]];
                        if (Object.keys(topFive).length > 5) {
                            delete topFive[fifth];
                            let lowest = topFive[masterTitle[i]];
                            Object.keys(topFive).forEach(key => {
                                if (topFive[key] <= lowest){
                                     fifth = key;
                                     lowest = topFive[fifth];
                                }
                            })
                        }
                    }

                    //Check if words are in top 5 and recalculate smallest top 5 if necessary
                    if (!topFive[fifth] || topFive[fifth] < storeDict[masterDescription[i]]) {
                        topFive[masterDescription[i]] = storeDict[masterDescription[i]];
                        if (Object.keys(topFive).length > 5) {
                            delete topFive[fifth];
                            let lowest = topFive[masterDescription[i]];
                            Object.keys(topFive).forEach(key => {
                                if (topFive[key] <= lowest){
                                     fifth = key;
                                     lowest = topFive[fifth];
                                }
                            })

                        }
                    }

                }

                //Attach each store's top 5 most common terms
                let topFiveKeys = Object.keys(topFive).sort((a,b)=> topFive[b]-topFive[a])
                store.topFive = Object.keys(topFive).map(key=>[key, topFive[key]]).sort((a,b)=>b[1]-a[1]);
                return {name: store.data.params.shop_id, topFive: store.topFive, order: topFiveKeys};

            })

            //Return stores to controller
            return stores;
        });

    };

    return EtsyFactoryObj;
});
