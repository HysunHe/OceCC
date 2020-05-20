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


        runAsync1().then(function (data) {
            return runAsync2();
        });

        function runAsync1(imgPath) {
            var p = new Promise(function (resolve, reject) {
                console.log('in runAsyunc1 ' + imgPath);
                var file = fs.createReadStream(imgPath);
                var status_adtp = "failed";

                console.log(file);

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

                    console.log(body);
                    console.log(typeof body)
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


                    console.log("recom2 -" + body);
                    console.log(typeof body);

                    var itemsCount = JSON.parse(body).results.count;
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
                            "url":"www.baidu.com",
                            "des":"this a description for test1 XXXXXXXXXXXX"
                        },{
                            "id":"102",
                            "name":"test2",
                            "price":"$140",
                            "url":"www.baidu.com",
                            "des":"this a description for test1 XXXXXXXXXXXX"
                        },{
                            "id":"103",
                            "name":"test3",
                            "price":"$160",
                            "url":"www.baidu.com",
                            "des":"this a description for test1 XXXXXXXXXXXX"
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
