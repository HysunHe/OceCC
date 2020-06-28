'use strict';


var config = require('./config');
var request = require("request");
var fs = require('fs');
const path = require('path');
var http = require('http');

const img_src = config.img_src;
const myAuth = 'Basic ' + Buffer.from(config.username + ":" + config.password).toString('base64');
const oceUrl = config.oceUrl;
const uploadFolder = config.uploadFolder;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


var url = 'https://iili.io/J0ygZ7.md.jpg';  //一张网络图片 https://ibb.co/ZG16z6q"><img src="https://i.ibb.co/q7FMYMT/louis-vuitton-M43775-PM2-Front-view.jpg
var checker = true;
var timeS = new Date().getTime();
var locImageName = "";
var locPath = "../components/image/";


function downloadUrl(url) {
    var p = new Promise(function (resolve, reject) {
        request.head(img_src, function (err, res, body) {
            if (err) {
                console.log(err);
            }
        });

        var img_filename = timeS + `pic.png`;
        var mPath = locPath + img_filename;
        request(img_src).pipe(fs.createWriteStream(mPath)).on("close", function (err) {
            console.log("文件[" + img_filename + "]下载完毕");
            console.log(mPath);
            locImageName = img_filename;
            resolve(mPath);
        });
    });
    return p;
}


function runAsync1(imgPath) {
    var p = new Promise(function (resolve, reject) {

        var file = fs.createReadStream(imgPath);
        var options = {
            method: 'POST',
            url: oceUrl + '/documents/api/1.2/files/data',
            headers:
                {
                    'cache-control': 'no-cache',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': myAuth
                },
            formData:
                {
                    jsonInputParameters: '{"parentID": "F1BC5EC1095678ED05A8C300C546E3164C583462DAD8"}',
                    primaryFile:
                        {
                            value: file,
                            options:
                                {
                                    filename: locImageName,
                                    contentType: null
                                }
                        }
                }
        };


        request(options, function (error, response, body) {
            deleteall(locPath);
            if (error) throw new Error(error);

            console.log(JSON.parse(body).id);
            var contentID = JSON.parse(body).id;
            resolve(contentID);
        });
    });
    return p;
}


function deleteall(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse

            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
    }
};


function runAsync2(contentID) {

    var p = new Promise(function (resolve, reject) {

        var options2 = {
            method: 'POST',
            url: oceUrl + '/content/management/api/v1.1/bulkItemsOperations',
            headers:
                {
                    'Postman-Token': '811fb779-1371-48eb-94a3-f0c12df4a456',
                    'cache-control': 'no-cache',
                    'Authorization': myAuth,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                },
            body:
                {
                    operations:
                        {
                            addToRepository:
                                {
                                    repositoryId: '03232BC331B144DA82943EA54C250177',
                                    externalIds: [contentID],
                                    collections: [],
                                    tags: [],
                                    connectorId: 'Documents',
                                    channels: [{id: 'RCHANNEL0220C9107FCE45D19684A69F19494060'}],
                                    taxonomies: []
                                }
                        }
                },
            json: true
        };

        request(options2, function (error, response, body) {
            if (error) throw new Error(error);

            checker = true;

            console.log(response.caseless.dict.location);

            resolve(response.caseless.dict.location);
            // if (response.caseless.dict.location) {
            //
            //     do {
            //         setTimeout(function () {
            //             getFileSatues(response)
            //         }, 500)
            //     } while (checker)
            // }
        });

    });
    return p;


}


function runAsync3(resp) {
    var p = new Promise(function (resolve, reject) {
        var options = {
            method: 'GET',
            url: resp,
            headers:
                {
                    'cache-control': 'no-cache',
                    'Authorization': myAuth
                }
        };
        request(options, function (error, response, body) {
                body = JSON.parse(body);
                if (error) {
                    reject(error);
                }
                ;
                var stp = body.progress;
                var stc = body.completed;

                if (stc == false) {
                    console.log('processing')
                    setTimeout(function () {
                        runAsync3(resp)
                    }, 500)
                } else if (stp == "succeeded" && stc == true) {
                    var outItems = body.result.body.operations.addToRepository.items;
                    checker = false;
                    console.log(outItems);
                    var objString = JSON.stringify(outItems).trim();
                    var st = objString.indexOf("[");
                    var nOt = objString.substr(st + 1, objString.length - 2);
                    console.log('in succeeeded');
                    console.log(JSON.parse(nOt).id);
                    var outID = JSON.parse(nOt).id;
                    setTimeout(function () {
                        runAsync4(outID);
                    }, 1500)
                }
                else {
                    console.log(body);
                    console.log('failed');
                }
            }
        );
    });
    return p;
}


function runAsync4(reId) {
    console.log(reId);
    console.log(oceUrl + '/content/management/api/v1.1/items/' + reId + '/tags');

    var options = {
        method: 'GET',
        url: oceUrl + '/content/management/api/v1.1/items/' + reId + '/tags',
        headers:
            {
                'cache-control': 'no-cache',
                'Authorization': myAuth,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(typeof body);
        console.log(JSON.parse(body));
        body = JSON.parse(body)
        if (body.data.length != 0) {
            var tagArr = [];
            body.data.forEach(function (v, i) {
                tagArr.push(v.name);
            });
            console.log(tagArr);
        } else {
            runAsync4(reId)
        }

    });
}

//
// downloadUrl(url).then(function (data) {
//     return runAsync1(data);
// }).then(function (data1) {
//     return runAsync2(data1);
// }).then(function (data2) {
//     return runAsync3(data2);
// });
// runAsync4('CONTA5191D5E1BAC4F9A9FA044E31E464F9A');
//
// var options = {
//     method: 'POST',
//     url: 'https://shenzhuoce01-sehubjapacprod.cec.ocp.oraclecloud.com/documents/api/1.2/files/data',
//     headers:
//         {
//             'cache-control': 'no-cache',
//             'Content-Type': 'application/form-data',
//             'Authorization': myAuth
//         },
//     formData:
//         {
//             jsonInputParameters: '{"parentID":"F1BC5EC1095678ED05A8C300C546E3164C583462DAD8"}',
//             primaryFile:
//                 {
//                     value: 'fs.createReadStream("' + img_src + '")',
//                     options: {filename: timeS + 'pic.png', contentType: null}
//                 }
//         }
// };
//
// request(options, function (error, response, body) {
//     if (error) throw new Error(error);
//
//     console.log(JSON.parse(body).id);
//     var contentID = JSON.parse(body).id;
//
//     var options2 = {
//         method: 'POST',
//         url: 'https://shenzhuoce01-sehubjapacprod.cec.ocp.oraclecloud.com/content/management/api/v1.1/bulkItemsOperations',
//         headers:
//             {
//                 'Postman-Token': '811fb779-1371-48eb-94a3-f0c12df4a456',
//                 'cache-control': 'no-cache',
//                 'Authorization': myAuth,
//                 'X-Requested-With': 'XMLHttpRequest',
//                 'Content-Type': 'application/json'
//             },
//         body:
//             {
//                 operations:
//                     {
//                         addToRepository:
//                             {
//                                 repositoryId: '03232BC331B144DA82943EA54C250177',
//                                 externalIds: [contentID],
//                                 collections: [],
//                                 tags: [],
//                                 connectorId: 'Documents',
//                                 channels: [{id: 'RCHANNEL0220C9107FCE45D19684A69F19494060'}],
//                                 taxonomies: []
//                             }
//                     }
//             },
//         json: true
//     };
//
//     request(options2, function (error, response, body) {
//         if (error) throw new Error(error);
//
//         checker = true;
//
//         console.log(response.caseless.dict.location);
//         if (response.caseless.dict.location) {
//
//             do {
//                 setTimeout(function () {
//                     getFileSatues(response)
//                 }, 500)
//             } while (checker)
//         }
//     });
// });
//
//
// function getFileSatues(response) {
//     var locationUrl = response.caseless.dict.location;
//     var options = {
//         method: 'GET',
//         url: locationUrl,
//         headers:
//             {
//                 'cache-control': 'no-cache',
//                 'Authorization': myAuth
//             }
//     };
//
//
//     request(options, function (error, response, body) {
//         console.log(JSON.parse(body));
//         if (error) throw new Error(error);
//         var stp = JSON.parse(body).progress;
//         if (stp == "processing") {
//             console.log('processing')
//         } else if (stp == "succeeded") {
//             var outItems = JSON.parse(body).result.body.operations.addToRepository.items;
//             checker = false;
//             console.log(outItems);
//             console.log(typeof outItems);
//             console.log(JSON.parse(JSON.stringify(outItems)))
//             console.log(typeof JSON.parse(JSON.stringify(outItems)));
//         } else {
//             console.log('failed')
//         }
//     });
// }
//
// let notUseTages = [
//     "valise",
//     "weekender",
//     "after-shave",
//     "after-shave lotion",
//     "smelling bottle",
//     "sweep hand",
//     "sweep-second",
//     "tacheometer",
//     "tachymeter",
//     "textile",
//     "ticker",
//     "timekeeper",
//     "timepiece",
//     "timer",
//     "toilet articles",
//     "toilet water",
//     "toiletry",
//     "poke",
//     "portfolio",
//     "purse",
//     "sack",
//     "sacking",
//     "satchel",
//     "second hand",
//     "patchouli",
//     "patchouly",
//     "overnighter",
//     "pachouli",
//     "hand",
//     "holdall",
//     "horologe",
//     "hour hand",
//     "imitation leather",
//     "indicator",
//     "instrument",
//     "leatherette",
//     "little hand",
//     "mailbag",
//     "man-made object",
//     "material",
//     "measuring device",
//     "measuring instrument",
//     "measuring system",
//     "mechanism",
//     "minute hand",
//     "movement",
//     "container",
//     "crystal",
//     "device",
//     "dial",
//     "eau de cologne",
//     "eau de toilette",
//     "fabric",
//     "briefcase",
//     "broad arrow",
//     "big hand",
//     "chronograph",
//     "chronoscope",
//     "cloth",
//     "cologne"
// ]
//
// function filterTag(tag){
//
//     console.log(notUseTages.some(item => item == tag ))
//     return 1
// }
//
//
// filterTag("dial");


let regItem = ['bag', 'watch', 'perfume'];

function tagIsAsset(tag) {

    var ck = regItem.length;
    console.log(ck)
    var oT = "0";
    for (var i = 0; i < regItem.length; i++) {
        if (tag == regItem[i]) {
            oT = regItem[i]
        }
    }

    return oT

}


setTimeout()
console.log(tagIsAsset('bag1'));


