'use strict';

var config = require('../util/config');
var request = require("request");
var fs = require('fs');
var Path = require('path')
var crypto = require('crypto');

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
        var locPath = "/image/";

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
                    var img_filename = timeS + `pic.png`;
                    var mPathD = locPath + img_filename;
                    console.log('downloading to 3 ' + __dirname);

                    var mPath = Path.join(__dirname, mPathD);

                    request(img_src).pipe(fs.createWriteStream(mPath)).on("finish", function (err) {
                        console.log("文件[" + img_filename + "]下载完毕");
                        locImageName = img_filename;
                        fs.readFile(mPath,'binary',function(err,data){
                            if(err){
                                console.log(err)
                            }else{
                                const buffer = new Buffer(data, 'binary');
                                var ownImage = buffer.toString('base64');
                                var ownResult = crypto.createHash('md5').update(ownImage).digest("hex");
                                config.imageID = ownResult
                            }
                            resolve(mPath);
                        });

                    });
                }
                )
            ;
            return p;
        }


        function runAsync1(imgPath) {
            var p = new Promise(function (resolve, reject) {
                console.log('in runAsyunc1 ' + imgPath);
                var file = fs.createReadStream(imgPath);

                console.log(file);

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
                            jsonInputParameters: '{"parentID": "F9CBCCA1436B701C469250D8215B1F7B2861B39A36A5"}',
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
                                            repositoryId: 'DAD3889C0B024419AB9F1A2DDABC0235',
                                            externalIds: [contentID],
                                            collections: [],
                                            tags: [],
                                            connectorId: 'Documents',
                                            channels: [{id: 'RCHANNELC12D88323EE541318B81817EA0794D75'}],
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
            var counter = 0;
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
                        counter++;
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

                            if (counter < 14) {
                                setTimeout(function () {
                                    runAsync3(resp)
                                }, 500)
                            }else{
                                conversation.reply(`error: Can not get tag from this image`)
                                conversation.transition(status_adtp);
                                conversation.keepTurn(true);
                                done();
                            }

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

                console.log(typeof body);
                console.log(JSON.parse(body));
                body = JSON.parse(body)
                if (body.data.length != 0) {
                    var tagArr = "";
                    var newAsset = "";

                    for (var m = 0; m< body.data.length;m++){

                        if(tagIsAsset(body.data[m].name) != "0")
                            newAsset  = tagIsAsset(body.data[m].name)
                    }



                    for (var k = 0; k< body.data.length;k++){

                        if(!tagIsJunk(body.data[k].name)){
                            if (tagArr == ""){
                                tagArr =  body.data[k].name
                            } else{
                                tagArr += ","+ body.data[k].name
                            }
                        }

                    }

                    console.log(tagArr);

                    var status_adtp = "success";

                    conversation.variable("itemName", newAsset);
                    conversation.variable("tagsArr", tagArr);
                    conversation.transition(status_adtp);
                    conversation.keepTurn(true);
                    done();

                } else {
                    runAsync4(reId)
                }

            });
        }

        let notUseTages = [
            "valise",
            "weekender",
            "after-shave",
            "after-shave lotion",
            "smelling bottle",
            "sweep hand",
            "sweep-second",
            "tacheometer",
            "tachymeter",
            "textile",
            "ticker",
            "timekeeper",
            "timepiece",
            "timer",
            "toilet articles",
            "toilet water",
            "toiletry",
            "poke",
            "portfolio",
            "purse",
            "sack",
            "sacking",
            "satchel",
            "second hand",
            "patchouli",
            "patchouly",
            "overnighter",
            "pachouli",
            "hand",
            "holdall",
            "horologe",
            "hour hand",
            "imitation leather",
            "indicator",
            "instrument",
            "leatherette",
            "little hand",
            "mailbag",
            "man-made object",
            "material",
            "measuring device",
            "measuring instrument",
            "measuring system",
            "mechanism",
            "minute hand",
            "movement",
            "container",
            "crystal",
            "device",
            "dial",
            "eau de cologne",
            "eau de toilette",
            "fabric",
            "briefcase",
            "broad arrow",
            "big hand",
            "chronograph",
            "chronoscope",
            "cloth",
            "cologne",
            'bag',
            'watch',
            'perfume'
        ]

        let regItem = ['bag', 'watch', 'perfume'];

        function tagIsAsset(tag) {
            var oT = "0";
            for (var i = 0; i < regItem.length; i++) {
                if (tag == regItem[i]) {
                    oT = regItem[i]
                }
            }

            return oT
        }

        function tagIsJunk(tag){
            return notUseTages.some(item => item == tag )
        }


    }
}
;
