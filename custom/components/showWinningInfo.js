'use strict';

const logger = require('../../utils/Logger');
// const dbop = require('../../utils/dboperation');
const moduleName = 'showWinningInfo';

module.exports = {
  metadata: () => ({
    name: moduleName,
    properties: {
      user: { required: true, type: 'string' },
    },
    supportedActions: []
  }),
  invoke: (conversation, done) => {
    // perform conversation tasks.
    const { user } = conversation.properties();
    logger.info(moduleName, "Got user: " + user);

    // let sqlConfig = {
    //     "sql": "select WINNING_INFO FROM CEAIR_USERS where OPENID=:OPENID",
    //     "bindParams": [user],
    //     "options": {autoCommit: true},
    //     "callback": function(result) {
    //       let winInfo = '未找到您的最新中奖信息！';
    //       if(result.rows.length > 0) {
    //           winInfo = '您的最新中奖信息为 「' + result.rows[0][0] + '」。';
    //       }

    //       conversation.reply(`${winInfo}`).transition();
    //       done();
    //     }
    // }
    // dbop.exec(sqlConfig, logger);

    conversation.reply('Good').transition();
    done();
  }
};

