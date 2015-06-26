/* DO NOT PUT IN STRICT MODE!
   The tests can't check for octals then!

   ... also, don't use octals. Please. :) */
var should = require('should');
var backslash = require('./');

it('should match newlines', function() {
  var s = backslash('\\n');
  s.should.equal('\n');
});

it('should match carriage returns', function() {
  var s = backslash('\\r');
  s.should.equal('\r');
});

it('should match tabs', function() {
  var s = backslash('\\t');
  s.should.equal('\t');
  var s = backslash('\\v');
  s.should.equal('\v');
});

it('should match backspaces', function() {
  var s = backslash('\\b');
  s.should.equal('\b');
});

it('should match formfeeds', function() {
  var s = backslash('\\f');
  s.should.equal('\f');
});

it('should match backslashes', function() {
  var s = backslash('\\\\');
  s.should.equal('\\');
});

it('should match all unicode characters', function() {
  this.timeout(0);
  for (var i = 0; i < 0xFFFF; i += 4) {
    var u = i.toString(16);
    u = (new Array((4 - u.length) + 1)).join('0') + u;
    var s = '\\u' + u;
    var c = eval('"\\u' + u + '"');
    var result = backslash(s);
    result.should.equal(c);
  }
});

it('should match all hex characters', function() {
  this.timeout(0);
  for (var i = 0; i < 0xFF; i++) {
    var x = i.toString(16);
    x = (new Array((2 - x.length) + 1)).join('0') + x;
    var s = '\\x' + x;
    var c = eval('"\\x' + x + '"');
    var result = backslash(s);
    result.should.equal(c);
  }
});

it('should match all octal characters', function() {
  this.timeout(0);
  for (var i = 0; i < 0xFF; i++) {
    var o = i.toString(8);
    var s = '\\' + o;
    var c = eval('"\\' + o + '"');
    var result = backslash(s);
    result.should.equal(c);
  }
});

it('should not overconsume high octals', function() {
  var s = backslash('\\456');
  s.should.equal('\456'); // \45 + '6', syntax highlighting likes to mess it up
  s.should.equal('\45' + '6'); // but just to be sure...
});

it('should allow non-important characters', function() {
  var s = backslash('\\i');
  s.should.equal('i');
});

it('should not allow invalid unicode characters', function() {
  (function() {
    backslash('\\uQIXX');
  }).should.throw();
});

it('should not allow invalid hex characters', function() {
  (function() {
    backslash('\\xiQ');
  }).should.throw();
});

function practical(str) {
  var parsed = eval('"' + str.replace('"', '\\"') + '"');
  return function() {
    var s = backslash(str);
    s.should.equal(parsed);
  };
}

describe('practical tests', function() {
  var tests = [
    "\\n",
    "This should be a new line.\\nAnd a CRLF\\n\\r",
    "Maybe some \\uBAFA korean? And some \\x1b[31mred\\x1b[0m?",
    "I think an \\157ctal is in order."
  ];

  tests.forEach(function(test) {
    it(test, practical(test));
  });
});
