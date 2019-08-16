const md = require('markdown-it')({ html: true })
  .use(require("markdown-it-inline-comments"))
  .use(require("markdown-it-html-entities"))
  .use(require("markdown-it-container"), 'verse');

var fs = require('fs');
var Mustache = require('mustache');
var kansuji = require('kansuji');
var kanjidate = require("kanjidate");

const PluginUtility = {
  '初期化': {
    type: 'func',
    josi: [],
    fn: function (sys) {
    }
  },

  'テンプレート取込': {
    type: 'func',
    josi: [['を', 'の']],
    fn: function (path) {
      fullpath = path + '.html';
      content = fs.readFileSync( fullpath, { "encoding": "utf8" } );
      Mustache.parse(content);
      return content;
    }
  },

  'テンプレートレンダー': {
    type: 'func',
    josi: [['を'], ['で']],
    fn: function (template, view) {
      return Mustache.render(template, view);
    }
  },

  'MDレンダー': {
    type: 'func',
    josi: [['を', 'の']],
    fn: function (s) {
      return md.render(s)
    }
  },

  '漢数字変換': {
    type: 'func',
    josi: [['を', 'の']],
    fn: function (n) {
      return kansuji(n);
    }
  },

  '元号変換': {
    type: 'func',
    josi: [['を', 'の']],
    fn: function (date) {
      let month = date[1];
      let day = date[2];
      let jpyear = kanjidate.toGengou(date[0], month, day);
      if(jpyear.nen == 1) {
        var year = "元";
      } else {
        var year = kansuji(jpyear.nen);
      }
      return [jpyear.gengou + year + "年", kansuji(month) + "月", kansuji(day) + "日"];
    }
  },

  'ISO変換': {
    type: 'func',
    josi: [['を', 'の']],
    fn: function (date) {
      return new Date(date).toISOString();
    }
  }
}

module.exports = PluginUtility
