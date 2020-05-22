'use strict';

var config = require('../util/config');
var request = require("request");
var fs = require('fs');
var Path = require('path')

module.exports = {
    metadata: () => ({
        name: 'getRecommendationProducts',
        "properties": {
            "tag1": {
                "type": "string",
                "required": true
            },
            "tag2": {
                "type": "string",
                "required": true
            }
        },
        supportedActions: ["success", "failed"]
    }),
    invoke: (conversation, done) => {

        var myAuth = 'Basic ' + Buffer.from(config.username + ":" + config.password).toString('base64');
        var oceUrl = config.oceUrl;

        var gotTag1 = conversation.properties().tag1;
        var gotTag2 = conversation.properties().tag2;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        var status_adtp = "failed";
        var outPutArr;

        // testUse();

        runAsync1().then(function (data) {
            return runAsync2();
        });

        function testUse() {
            status_adtp = "success";
            outPutArr = [
                {
                    "id": "101",
                    "name": "test1",
                    "price": "$120",
                    "url": "https://www.oracle.com/cloud/content-and-experience-management/",
                    "imageUrl": "https://iili.io/J0ygZ7.md.jpg",
                    "des": "this a description for test1 XXXXXXXXXXXX"
                }, {
                    "id": "102",
                    "name": "test2",
                    "price": "$140",
                    "url": "https://www.oracle.com/index.html",
                    "imageUrl": "https://www.milanstand.com/images/201803/goods_img/37321_P_1520570187236.JPG",
                    "des": "this a description for test2 XXXXXXXXXXXX"
                }, {
                    "id": "103",
                    "name": "test3",
                    "price": "$160",
                    "url": "https://developer.oracle.com/ai-ml/",
                    "imageUrl": "https://p0.ssl.qhimgs4.com/t0197888a68d5955dbc.jpg",
                    "des": "this a description for test3 XXXXXXXXXXXX"
                }
            ]

            conversation.variable("outPutArr", outPutArr);
            conversation.transition(status_adtp);
            conversation.keepTurn(true);
            done();
        }

        function runAsync1() {
            var p = new Promise(function (resolve, reject) {


                var options = {
                    method: 'PUT',
                    url: oceUrl + '/content/management/api/v1.1/personalization/recommendations/RECO4441E4CB03F24A3C935F7C4BFBA49A39?links=none',
                    qs: {links: 'none'},
                    headers:
                        {
                            'cache-control': 'no-cache',
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'Authorization': myAuth
                        },
                    body:
                        {
                            name: 'test_recommendation',
                            description: '',
                            apiName: 'test_recommendation',
                            repositoryId: 'DAD3889C0B024419AB9F1A2DDABC0235',
                            main:
                                [{
                                    rules:
                                        [{
                                            operator: 'bestMatch',
                                            parameters:
                                                [{
                                                    contentType: {name: 'SE-Story'},
                                                    id: '516D4F3E9DA74ECBA590CF5F5F6E3AC5',
                                                    name: 'contenttags',
                                                    type: 'userAssetField'
                                                },
                                                    {value: gotTag1, type: 'literal'},
                                                    {value: gotTag2, type: 'literal'}]
                                        },
                                            {
                                                operator: 'bestMatch',
                                                parameters:
                                                    [{
                                                        contentType: {name: 'SE-Story'},
                                                        id: 'C94C8EFAA25244868892FAC4028200B7',
                                                        name: 'title',
                                                        type: 'userAssetField'
                                                    },
                                                        {type: 'literal', value: gotTag1},
                                                        {type: 'literal', value: gotTag2}
                                                    ]
                                            },
                                            {
                                                operator: 'bestMatch',
                                                parameters:
                                                    [{
                                                        contentType: {name: 'SE-Story'},
                                                        id: 'B58EE504741344AD97FBD2F34771CAEE',
                                                        name: 'product',
                                                        type: 'userAssetField'
                                                    },
                                                        {type: 'literal', value: gotTag1},
                                                        {type: 'literal', value: gotTag2}
                                                    ]
                                            }
                                        ],
                                    properties: {operator: 'ANY'},
                                    sort: [':relevance']
                                }],
                            channels: [{id: 'CHANNELFC9C84C86994247CDA59D360907912466EBA9AF8876F'}, {"id": "RCHANNELC12D88323EE541318B81817EA0794D75"}],
                            defaults: [{items: [], sort: []}],
                            contentTypes: [{name: 'SE-Story'}]
                        },
                    json: true
                };


                request(options, function (error, response, body) {
                    if (error) {
                        conversation.transition(status_adtp);
                        conversation.keepTurn(true);
                        done();
                        reject(error);
                    }
                    ;
                    console.log("###############set up conditions ###########");
                    console.log(body);
                    if (body.isPublished) {
                        resolve();
                    } else {
                        conversation.transition(status_adtp);
                        conversation.keepTurn(true);
                        done();
                        reject(error);
                    }
                });
            });
            return p;
        }


        function runAsync2() {

            var p = new Promise(function (resolve, reject) {

                var options = {
                    method: 'POST',
                    url: oceUrl + '/content/management/api/v1.1/personalization/recommendationResults/test_recommendation',
                    qs:
                        {
                            fields: 'all',
                            offset: '0',
                            limit: '5'
                        },
                    headers:
                        {
                            'cache-control': 'no-cache',
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'Authorization': myAuth
                        },
                    body: {audienceAttributes: {}, assetState: 'ALL'},
                    json: true
                };

                request(options, function (error, response, body) {
                    if (error) {
                        conversation.transition(status_adtp);
                        conversation.keepTurn(true);
                        done();
                        reject(error);
                    }
                    ;

                    console.log("###############see running results ###########");
                    console.log(body);
                    console.log(typeof body);
                    status_adtp = "success";

                    var itemsCount = body.results.count;
                    console.log(itemsCount);
                    if (itemsCount == 0) {
                        conversation.variable("outPutArr", "0");
                        conversation.transition(status_adtp);
                        done();
                    } else {
                        outPutArr = [];
                        var outComeCells = body.results.items
                        outComeCells.forEach(function (v) {
                            var nID = v.id;
                            var nImageId = v.fields.media.id;
                            console.log(nID);
                            var nName = v.name;
                            var nPrice = '$' + v.fields.price.toString();
                            var nStore = v.fields.industry[0];
                            var nImage = "https://ydoce-aplcloud.cec.ocp.oraclecloud.com/content/published/api/v1.1/assets/" + nImageId+ "/Small?format=jpg&type=responsiveimage&channelToken=4e202a590f8d4f6eaabc7e95e2f9afa1"
                            var nDes = v.fields.summary;
                            var nUrl = oceUrl + '/sites/preview/onlineshop/storydetails/SE-Story/' + v.id + '/' + v.slug;

                            var nObj = {
                                "id": nID,
                                "name": nName,
                                "price": nPrice,
                                "store": nStore,
                                "url": nUrl,
                                "imageUrl": nImage,
                                "des": nDes
                            }

                            outPutArr.push(nObj);
                        });

                        console.log(outPutArr);
                        conversation.variable("outPutArr", outPutArr);
                        conversation.transition(status_adtp);
                        conversation.keepTurn(true);
                        done();
                    }
                });

            });
            return p;


        }

    }
}
;
