const md = require('markdown-it')({
    html: true,
    replaceLink: function (link, env) {
      // Find all absolute links
      var r = new RegExp('^(?:[a-z]+:)?/?/', 'i');
      if(r.test(link)) {
        return link;
      } else {
        return "/" + link
      }
    }
  })
  .use(require("markdown-it-inline-comments"))
  .use(require("markdown-it-ruby"))
  .use(require("markdown-it-html-entities"))
  .use(require("markdown-it-fontawesome"))
  .use(require("markdown-it-container"), 'unstyled')
  .use(require("markdown-it-container"), 'verse')
  .use(require("markdown-it-container"), 'gallery')
  .use(require('markdown-it-replace-link'))
  .use(require("markdown-it-implicit-figures"), {
    figcaption: true,
    link: true
  })
  .use(require("markdown-it-hashtag"),{
    // This would be much nicer but required 'markdown-it-hashtag' to pass 'u' to the regex
    // hashtagRegExp: '\\p{L}+',
    hashtagRegExp: '!?(?:\\w|[^\\u0000-\\u007F])+',
    preceding:     '^|\\s'
  });

var fs = require('fs');
var Mustache = require('mustache');
var kansuji = require('kansuji');
var kanjidate = require("kanjidate");

const execSync = require('child_process').execSync;

md.renderer.rules.hashtag_open  = function(tokens, idx) {
  var tagName = tokens[idx].content;
  return '<a href="/' + tagName + '" class="hashtag">';
}

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

  '作成日付': {
    type: 'func',
    josi: [['の']],
    fn: function (path) {
      let date = execSync('git log --diff-filter=A --format=format:%aI --follow -1 ' + path);
      if(date.length > 0) {
        return date.toString();
      } else {
        return undefined;
      }
    }
  },

  '更新日付': {
    type: 'func',
    josi: [['の']],
    fn: function (path) {
      let date = execSync('git log --diff-filter=U --format=format:%aI -1 ' + path);
      if(date.length > 0) {
        return date.toString();
      } else {
        return undefined;
      }
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
    fn: function (isodate) {
      var date = new Date(isodate)
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let jpyear = kanjidate.toGengou(date.getFullYear(), month, day);
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
