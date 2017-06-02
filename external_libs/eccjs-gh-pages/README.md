ecc.js
=====

Simple wrapper around [SJCL](http://bitwiseshiftleft.github.io/sjcl/)'s [ECC](http://en.wikipedia.org/wiki/Elliptic_curve_cryptography) Implementation `v0.3.0` (Beta)

## Download

#### Browser

* [ecc.js](https://raw.github.com/jpillora/eccjs/gh-pages/dist/0.3/ecc.js)
* [ecc.min.js](https://raw.github.com/jpillora/eccjs/gh-pages/dist/0.3/ecc.min.js)

#### Node

```
npm install eccjs
```

## Features

* Easy to use
* Includes [SJCL](http://bitwiseshiftleft.github.io/sjcl/) as `ecc.sjcl`

## Demo

http://jpillora.com/eccjs

## Quick Usage

**Encryption and Decryption**

``` js
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
```

**Sign and Verify**

``` js
// Generate (or load) sign/verify keys 
var keys = ecc.generate(ecc.SIG_VER);
// => { sig: "192e35a51dc....", ver: "192037..." }

// An important message
var message = "hello world!";

// Create digital signature
var signature = ecc.sign(keys.sig, message);

// Verify matches the text
var result = ecc.verify(keys.ver, signature, message);

console.log(result); // => true
```

## API

* `ecc.generate(type[, curve = 192])`
* `ecc.encrypt(key, plaintext)`
* `ecc.decrypt(key, cipher)`
* `ecc.sign(key, text[, hash = true])`
* `ecc.verify(key, signature, text[, hash = true])`

## Todo

* Improve Performance
* Timeout Cache?

---

#### MIT License

Copyright © 2013 Jaime Pillora &lt;dev@jpillora.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
