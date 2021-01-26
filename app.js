const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");

// db 관련
const db = require("./models");

class App {
  constructor() {
    this.app = express();

    // db 접속
    this.dbConnection();

    // 뷰엔진 셋팅
    this.setViewEngine();

    // 미들웨어 셋팅
    this.setMiddleWare();

    // 라우팅
    this.getRouting();
  }

  dbConnection() {}

  setMiddleWare() {
    this.app.use(logger("dev"));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: false}));
  }

  setViewEngine() {}

  getRouting() {}
}

module.exports = new App().app;
