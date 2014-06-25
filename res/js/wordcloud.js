var $ = require('./jquery-1.7.1');
var d3 = require('./d3');
var cloudLayout = require('./d3.layout.cloud');

;(function () {
var WordCloud = function (config) {
  this.config = config;
  //  4 params must need
  var container = typeof config.container === 'string' ? document.getElementById(config.container) //id
    : config.container; // dom node
  var data = config.data || 'Note: although the d3-cloud library is open-source, the Word Cloud Generator that uses d3-cloud is not open-source and is protected by copyright. The generated SVG or PNG images can be used for any purpose.';
  var width = config.width || $(container).width() || 960;
  var height = config.height || $(container).height() || 500;
  var margin = config.margin || {top: 5, right: 5, bottom: 5, left: 5};
  var getColor = config.getColor || d3.scale.category20();
  var wordSizeRatio = config.wordSizeRatio || 0.002;

  this.setSource = function (sourceData) {
    data = sourceData;
  };

  this.setOptions = function (config) {
    width = config.width || width;
    height = config.height || height;
    margin = config.margin || margin;
    getColor = config.getColor || getColor;
    wordSizeRatio = config.wordSizeRatio || wordSizeRatio;
  };

  var parse = function (text) {
    var tags;
    var maxLength = 30;
    // From Jonathan Feinberg's cue.language, see lib/cue.language/license.txt.
    var unicodePunctuationRe = "!-#%-*,-/:;?@\\[-\\]_{}¡§«¶·»¿;·՚-՟։֊־׀׃׆׳״؉؊،؍؛؞؟٪-٭۔܀-܍߷-߹࠰-࠾࡞।॥॰૰෴๏๚๛༄-༒༔༺-༽྅࿐-࿔࿙࿚၊-၏჻፠-፨᐀᙭᙮᚛᚜᛫-᛭᜵᜶។-៖៘-៚᠀-᠊᥄᥅᨞᨟᪠-᪦᪨-᪭᭚-᭠᯼-᯿᰻-᰿᱾᱿᳀-᳇᳓‐-‧‰-⁃⁅-⁑⁓-⁞⁽⁾₍₎〈〉❨-❵⟅⟆⟦-⟯⦃-⦘⧘-⧛⧼⧽⳹-⳼⳾⳿⵰⸀-⸮⸰-⸻、-〃〈-】〔-〟〰〽゠・꓾꓿꘍-꘏꙳꙾꛲-꛷꡴-꡷꣎꣏꣸-꣺꤮꤯꥟꧁-꧍꧞꧟꩜-꩟꫞꫟꫰꫱꯫﴾﴿︐-︙︰-﹒﹔-﹡﹣﹨﹪﹫！-＃％-＊，-／：；？＠［-］＿｛｝｟-･";

    var stopWords = /^(i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/,
        punctuation = new RegExp("[" + unicodePunctuationRe + "]", "g"),
        wordSeparators = /[\s\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g,
        discard = /^(@|https?:)/,
        htmlTags = /(<[^>]*?>|<script.*?<\/script>|<style.*?<\/style>|<head.*?><\/head>)/g,
        matchTwitter = /^https?:\/\/([^\.]*\.)?twitter\.com/;

    function parseHTML(d) {
      parseText(d.replace(htmlTags, " ").replace(/&#(x?)([\dA-Fa-f]{1,4});/g, function(d, hex, m) {
        return String.fromCharCode(+((hex ? "0x" : "") + m));
      }).replace(/&\w+;/g, " "));
    }

    function parseText(text) {
      tags = {};
      var cases = {};
      text.split(wordSeparators).forEach(function(word) {
        if (discard.test(word)) return;
        word = word.replace(punctuation, "");
        if (stopWords.test(word.toLowerCase())) return;
        word = word.substr(0, maxLength);
        cases[word.toLowerCase()] = word;
        tags[word = word.toLowerCase()] = (tags[word] || 0) + 1;
      });
      tags = d3.entries(tags).sort(function(a, b) { return b.value - a.value; });
      tags.forEach(function(d) { d.key = cases[d.key]; });
    }

    parseHTML(text);
    //[{"key":"d3-cloud","value":2},{"key":"open-source","value":1},{"key":"Note:","value":1}]
    return tags;
  };

  var render = this.render = function () {
    d3.select(container).select('svg').remove();
    //$(container).empty();

    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom;
    var tags = parse(data);
    var sum = d3.sum(tags, function (d) { return d.value; });
    tags.forEach(function (d) {
      d.size = d.value * w * h / sum * wordSizeRatio;
    });

    cloudLayout().size([w, h])
        .words(tags)
        .padding(5)
        .rotate(function() { return Math.random() * 120 - 60;/*~~(Math.random() * 2) * 90;*/ })
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", draw)
        .start();

    function draw(words) {
      var canvas = d3.select(container).append('svg')
          .attr("width", width)
          .attr("height", height)
        .append("g")
          .attr("transform", "translate(" + w / 2 + ',' + h / 2 + ")");
      canvas.selectAll("text")
          .data(words)
        .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("font-family", "Impact")
          .style("fill", function(d, i) { return getColor(i); })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.key; });
    }
  };
};
module.exports = WordCloud;
}());