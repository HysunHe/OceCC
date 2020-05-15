CREATE TABLE  "CEAIR_USERS"
(   
    "OPENID"                VARCHAR2(256) PRIMARY KEY,
    "NICKNAME"              VARCHAR2(50),
    "HEADIMGURL"            VARCHAR2(2048),
    "USERNAME"              VARCHAR2(50),
    "MEMBERNAME"            VARCHAR2(50),
    "IDCARD"                VARCHAR2(20),
    "MOBILE"                VARCHAR2(20),
    "SEX"                   VARCHAR2(10),
    "PROVINCE"              VARCHAR2(50),
    "CITY"                  VARCHAR2(50),
    "COUNTRY"               VARCHAR2(50),
    "UNIONID"               VARCHAR2(256),
    "MBCARDNO"              VARCHAR2(50),
    "MBCARDCREATED"         VARCHAR2(20),
    "MBCARDEXP"             VARCHAR2(20),
    "CREATED"               VARCHAR2(20),
    "ACCESS_TOKEN"          VARCHAR2(2048),
    "WINNING_INFO"          VARCHAR2(512),
    "ADDRESS"               VARCHAR2(512),
    "PASSWORD"              VARCHAR2(512)
);