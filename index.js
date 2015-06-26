'use strict';

var punycode = require('punycode');

function BackslashError(offset, err) {
  this.__proto__ = new Error(err);
  this.__proto__.name = 'BackslashError';
  this.offset = offset;
}

module.exports = function backslash(str) {
  return str.replace(
      /\\(?:u(.{4})|x(.{2})|([0-7]{1,3})|((?![ux])[89a-zA-Z\\]))/g,
      function(m, u, x, o, c, offset) {
        switch (false) {
        case u === undefined:
          // check for invalid characters
          // we do this here instead of in the source regex because
          // javascript does it. :)
          m = /[^a-f0-9]/gi.exec(u);
          if (m !== null) {
            throw new BackslashError(offset + m.index,
                'Unexpected token ILLEGAL');
          }

          u = parseInt(u, 16);
          // http://stackoverflow.com/a/9109467/510036
          return punycode.ucs2.encode([u]);

        case x === undefined:
          m = /[^a-f0-9]/gi.exec(x);
          if (m !== null) {
            throw new BackslashError(offset + m.index,
                'Unexpected token ILLEGAL');
          }

          x = parseInt(x, 16);
          return punycode.ucs2.encode([x]);

        case o === undefined:
          var r = '';
          if (o.length === 3 && parseInt(o[0]) > 3) {
            r = o[2];
            o = o.substring(0, 2);
          }
          o = punycode.ucs2.encode([parseInt(o, 8)]);
          return o + r;

        case c === undefined:
          switch (c) {
          case 'n': return '\n';
          case 'r': return '\r';
          case 'f': return '\f';
          case 'b': return '\b';
          case 't': return '\t';
          case 'v': return '\v';
          case '\\': return '\\';
          default: return c;
          }
        }
      });
};
