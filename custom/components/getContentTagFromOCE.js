'use strict';

var config = require('../util/config');
var request = require("request");
var fs = require('fs');
var Path = require('path')

module.exports = {
    metadata: () => ({
        name: 'getContentTagFromOCE',
        "properties": {
            "image": {
                "type": "string",
                "required": true
            },
            "type": {
                "type": "string",
                "required": true
            }
        },
        supportedActions: ["success", "failed"]
    }),
    invoke: (conversation, done) => {

        var myAuth = 'Basic ' + Buffer.from(config.username + ":" + config.password).toString('base64');
        var oceUrl = config.oceUrl;
        var uploadFolder = config.uploadFolder;
        var checker = true;
        var timeS = new Date().getTime();
        var locImageName = "";
        var locPath = "./image/";

        var status_adtp = "failed";
        var imageUrl = conversation.properties().image;
        var imageType = conversation.properties().type;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


        if (imageType !== "image") {
            conversation.reply(`Your file type: ` + imageType + ' is not valid.')
            conversation.transition(status_adtp);
            done();
        } else {

            console.log("imageURL: " + imageUrl);
            downloadUrl(imageUrl).then(function (data) {
                return runAsync1(data);
            }).then(function (data1) {
                return runAsync2(data1);
            }).then(function (data2) {
                return runAsync3(data2);
            });

        }


        function downloadUrl(img_src) {
            var p = new Promise(function (resolve, reject) {
                    request.head(img_src, function (err, res, body) {
                        if (err) {
                            console.log(err);
                        }
                    });

                    console.log('downloading')
                    var img_filename = timeS + `pic.jpg`;
                    // var mPath = locPath + img_filename;
                    console.log('downloading to 3 ' + __dirname);

                  var  mPath = Path.join('image', img_filename);

                    var writeStream=fs.createWriteStream(mPath)
                    console.log('d5 ');
                    // request(img_src).pipe(writeStream);
                    // console.log('d6 ');
                    writeStream.on('finish',function(){
                        // console.log(mPath);
                        // locImageName = img_filename;
                        // resolve(mPath);
                        console.log('文件写入成功')
                    })

                    // request(img_src).pipe(fs.createWriteStream(mPath, {mode: 0o755})).on("open", function (err) {
                    //     console.log("文件[" + img_filename + "]下载完毕");
                    //     console.log(mPath);
                    //     locImageName = img_filename;
                    //     resolve(mPath);
                    // });
                }
                )
            ;
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
                    if (error) {
                        conversation.transition(status_adtp);
                        conversation.keepTurn(true);
                        done();
                        reject(error);
                    }
                    ;

                    conversation.reply(`Greetings ` + body)
                    conversation.transition(status_adtp);
                    done();
                    // console.log(body.id);
                    // var contentID = body.id;
                    // resolve(contentID);
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
                    if (error) {
                        conversation.transition(status_adtp);
                        conversation.keepTurn(true);
                        done();
                        reject(error);
                    }
                    ;

                    checker = true;

                    console.log(response.caseless.dict.location);

                    resolve(response.caseless.dict.location);
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
                        // body = JSON.parse(body);
                        if (error) {
                            conversation.transition(status_adtp);
                            conversation.keepTurn(true);
                            done();
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
                if (error) {
                    conversation.transition(status_adtp);
                    conversation.keepTurn(true);
                    done();
                }
                ;
                console.log(typeof body);
                // console.log(JSON.parse(body));
                // body = JSON.parse(body)
                if (body.data.length != 0) {
                    var tagArr = [];
                    body.data.forEach(function (v, i) {
                        tagArr.push(v.name);
                    });
                    console.log(tagArr);

                    var status_adtp = "success";

                    conversation.variable("tagsArr", tagArr);
                    conversation.transition(status_adtp);
                    conversation.keepTurn(true);
                    done();

                } else {
                    runAsync4(reId)
                }

            });
        }


    }
}
;
