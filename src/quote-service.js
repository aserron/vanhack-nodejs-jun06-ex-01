const logger = require('morgan');

// requests library
const axios = require("axios");

// your choice of HTML parser
const cheerio = require("cheerio");
const jsdom = require("jsdom");

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const quotesRouter = require('./routes/quotes');
const authorsRouter = require('./routes/authors');


const createService = () => {

  const app = express();
  
  const created = new Date(Date.now())
  const _time   = created.toLocaleTimeString()
  
  console.log(`[${_time}] Creating Express App env=`,app.get('env'),"\n")
  
  app.quoteCache = {}
  app.created = created;

  
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // handling of static content.
  let staticRoot = path.join(__dirname, '../public');
  
  // console.log(staticRoot)
  
  app.use(express.static(staticRoot));
  
  /* go ahead and code! */
  
  app.use('/', indexRouter);
  app.use('/quotes', quotesRouter);
  app.use('/authors', authorsRouter);

  return app;
};
  

module.exports = { createService }; 