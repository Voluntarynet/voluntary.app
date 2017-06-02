
// Node.js
// var ecc = require('../dist/0.1/ecc');

var edkeys = ecc.generate(ecc.ENC_DEC);
function encdec(text) {
  console.time('encdec ' + text);
  var cipher = ecc.encrypt(edkeys.enc, text);
  var plain = ecc.decrypt(edkeys.dec, cipher);
  console.timeEnd('encdec ' + text);
  console.log(plain);
}

var svkeys = ecc.generate(ecc.SIG_VER);
function sigver(text) {
  console.time('sigver ' + text);
  var sig = ecc.sign(svkeys.sig, text);
  var matches = ecc.verify(svkeys.ver, sig, text);
  console.timeEnd('sigver ' + text);
  console.log(matches);
}

encdec("hello world, one!");
encdec("hello world, two!");
encdec("hello world, three!");

sigver("hello world, one!");
sigver("hello world, two!");
sigver("hello world, three!");