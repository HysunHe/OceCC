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


        testUse();

        // runAsync1().then(function (data) {
        //     return runAsync2();
        // });

        function testUse(){
            status_adtp = "success";
            var outPutArr = [
                {
                    "id":"101",
                    "name":"test1",
                    "price":"$120",
                    "color":"$120",
                    "url":"https://www.oracle.com/cloud/content-and-experience-management/",
                    "imageUrl":"https://iili.io/J0ygZ7.md.jpg",
                    "des":"this a description for test1 XXXXXXXXXXXX"
                },{
                    "id":"102",
                    "name":"test2",
                    "price":"$140",
                    "url":"https://www.oracle.com/index.html",
                    "imageUrl":"https://www.milanstand.com/images/201803/goods_img/37321_P_1520570187236.JPG",
                    "des":"this a description for test2 XXXXXXXXXXXX"
                },{
                    "id":"103",
                    "name":"test3",
                    "price":"$160",
                    "url":"https://developer.oracle.com/ai-ml/",
                    "imageUrl":"https://p0.ssl.qhimgs4.com/t0197888a68d5955dbc.jpg",
                    "des":"this a description for test3 XXXXXXXXXXXX"
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
                    url: oceUrl + '/content/management/api/v1.1/personalization/recommendations/RECOFAAB3DF21FCC494D82739FB2F6275B13?links=none',
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
                            repositoryId: '03232BC331B144DA82943EA54C250177',
                            main:
                                [{
                                    rules:
                                        [{
                                            operator: 'bestMatch',
                                            parameters:
                                                [{
                                                    contentType: {name: 'SE-Story'},
                                                    id: 'DA8E2628CE744A358258194FFC1156E1',
                                                    name: 'title',
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
                                                        id: '19FE7E4D0C7443C988053085A887AC3F',
                                                        name: 'contenttags',
                                                        type: 'userAssetField'
                                                    },
                                                        {type: 'literal', value: gotTag1},
                                                        {type: 'literal', value: gotTag2}
                                                        ]
                                            }],
                                    properties: {operator: 'ANY'},
                                    sort: [':relevance']
                                }],
                            channels: [{id: 'CHANNELF79D9A7881CBD7ADB0B4B7E4B7FB839F21E9AD0BBD68'}],
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
                    if (body.isPublished){
                        resolve();
                    }
                });
            });
            return p;
        }


        function runAsync2() {

            var p = new Promise(function (resolve, reject) {

                var options = { method: 'POST',
                    url: oceUrl + '/content/management/api/v1.1/personalization/recommendationResults/test_recommendation',
                    qs:
                        { fields: 'all',
                            channelToken: '1ba782a949674df9b5098d50e18a152f',
                            offset: '0',
                            limit: '5' },
                    headers:
                        {
                            'cache-control': 'no-cache',
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'Authorization': myAuth
                        },
                    body: { audienceAttributes: {}, assetState: 'ALL' },
                    json: true };

                request(options, function (error, response, body) {
                    if (error) {
                        conversation.transition(status_adtp);
                        conversation.keepTurn(true);
                        done();
                        reject(error);
                    };

                    console.log("###############see running results ###########");
                    console.log(body);

                    {
                        "description": "",
                        "id": "CORE46BCD76B371C4F31B71AC8EACA4F9161",
                        "repositoryId": "03232BC331B144DA82943EA54C250177",
                        "name": "Alma Bb Damier Ebene Brown",
                        "fields": {
                        "summary": "The Alma BB handbag traces its pedigree to the Art Deco original, introduced in 1934. Signature details impart a timeless elegance to this model made from graphic Damier Ebene canvas: note the golden padlock and keys, twin Toron handles and chic leather key bell. Equipped with a removable strap, this charming small bag is perfect for cross-body wear.",
                            "color": "Brown",
                            "media": {
                            "id": "CONT4B395C13C56C4A649826C4A5E6DFDFE4",
                                "type": "DigitalAsset",
                                "links": [
                                {
                                    "href": "https://shenzhuoce01-sehubjapacprod.cec.ocp.oraclecloud.com/content/management/api/v1.1/items/CONT4B395C13C56C4A649826C4A5E6DFDFE4",
                                    "rel": "self",
                                    "method": "GET",
                                    "mediaType": "application/json"
                                }
                            ]
                        },
                        "title": "Alma Bb Damier Ebene Brown",
                            "contenttags": [
                            "shoulder bag",
                            "satchel",
                            "bag",
                            "overnight case"
                        ]
                    }
                    }

                    var itemsCount = body.results.count;
                    console.log(itemsCount);
                    if (itemsCount == 0){

                    } else{

                    }
                    status_adtp = "success";
                    var outPutArr = [
                        {
                            "id":"101",
                            "name":"test1",
                            "price":"$120",
                            "color":"$120",
                            "url":"https://www.oracle.com/cloud/content-and-experience-management/",
                            "imageUrl":"https://iili.io/J0ygZ7.md.jpg",
                            "des":"this a description for test1 XXXXXXXXXXXX"
                        },{
                            "id":"102",
                            "name":"test2",
                            "price":"$140",
                            "url":"https://www.oracle.com/index.html",
                            "imageUrl":"https://www.milanstand.com/images/201803/goods_img/37321_P_1520570187236.JPG",
                            "des":"this a description for test2 XXXXXXXXXXXX"
                        },{
                            "id":"103",
                            "name":"test3",
                            "price":"$160",
                            "url":"https://developer.oracle.com/ai-ml/",
                            "imageUrl":"https://p0.ssl.qhimgs4.com/t0197888a68d5955dbc.jpg",
                            "des":"this a description for test3 XXXXXXXXXXXX"
                        }
                    ]

                    conversation.variable("outPutArr", outPutArr);
                    conversation.transition(status_adtp);
                    conversation.keepTurn(true);
                    done();
                });

            });
            return p;


        }

    }
}
;
