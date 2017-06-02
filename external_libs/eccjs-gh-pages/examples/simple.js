
// Node.js
// var ecc = require('../dist/0.1/ecc');




// Generate (or load) encryption/decryption keys 
var keys = ecc.generate(ecc.ENC_DEC);
// => { dec: "192e35a51dc....", enc: "192037..." }

// A secret message
var plaintext = "hello world!";

// Encrypt message
var cipher = ecc.encrypt(keys.enc, plaintext);
// => {"iv":[1547037338,-736472389,324... }

// Decrypt message
var result = ecc.decrypt(keys.dec, cipher);

console.log(plaintext === result);
// => true




// Generate (or load) sign/verify keys 
var keys = ecc.generate(ecc.SIG_VER);
// => { dec: "192e35a51dc....", enc: "192037..." }

// An important message
var message = "hello world!";

// Create digital signature
var signature = ecc.sign(keys.sig, message);

// Verify matches the text
var result = ecc.verify(keys.ver, signature, message);

console.log(result); // => trues