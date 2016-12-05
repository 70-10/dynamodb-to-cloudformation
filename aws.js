"use strict";

const AWS = require("aws-sdk");
AWS.config.setPromisesDependency(Promise);
AWS.config.region = "ap-northeast-1";

module.exports = AWS;
