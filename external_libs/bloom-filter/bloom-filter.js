require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var MurmurHash3 = require('./murmurhash3');

/**
 * A Bloom Filter implemented as for use in Bitcoin Connection Bloom Filtering (BIP37) that
 * uses version 3 of the 32-bit Murmur hash function.
 *
 * @see https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki
 * @see https://github.com/bitcoin/bitcoin/blob/master/src/bloom.cpp
 *
 * @param {Object} data - The data object used to initialize the filter.
 * @param {Array} data.vData - The data of the bloom filter.
 * @param {Number} data.nHashFuncs - The number of hash functions.
 * @param {Number} data.nTweak - A random value to seed the hash functions.
 * @param {Number} data.nFlag - A flag to determine how matched items are added to the filter.
 * @constructor
 */
function Filter(arg) {
  /* jshint maxcomplexity: 10 */
  if (typeof(arg) === 'object') {
    if (!arg.vData) {
      throw new TypeError('Data object should include filter data "vData"');
    }
    if (arg.vData.length > Filter.MAX_BLOOM_FILTER_SIZE * 8) {
      throw new TypeError('"vData" exceeded max size "' + Filter.MAX_BLOOM_FILTER_SIZE + '"');
    }
    this.vData = arg.vData;
    if (!arg.nHashFuncs) {
      throw new TypeError('Data object should include number of hash functions "nHashFuncs"');
    }
    if (arg.nHashFuncs > Filter.MAX_HASH_FUNCS) {
      throw new TypeError('"nHashFuncs" exceeded max size "' + Filter.MAX_HASH_FUNCS + '"');
    }
    this.nHashFuncs = arg.nHashFuncs;
    this.nTweak = arg.nTweak || 0;
    this.nFlags = arg.nFlags || Filter.BLOOM_UPDATE_NONE;
  } else {
    throw new TypeError('Unrecognized argument');
  }
}

Filter.prototype.toObject = function toObject() {
  return {
    vData: this.vData,
    nHashFuncs: this.nHashFuncs,
    nTweak: this.nTweak,
    nFlags: this.nFlags
  };
};

Filter.create = function create(elements, falsePositiveRate, nTweak, nFlags) {
  /* jshint maxstatements: 18 */

  var info = {};

  // The ideal size for a bloom filter with a given number of elements and false positive rate is:
  // * - nElements * log(fp rate) / ln(2)^2
  // See: https://github.com/bitcoin/bitcoin/blob/master/src/bloom.cpp
  var size = -1.0 / Filter.LN2SQUARED * elements * Math.log(falsePositiveRate);
  var filterSize = Math.floor(size / 8);
  var max = Filter.MAX_BLOOM_FILTER_SIZE * 8;
  if (filterSize > max) {
    filterSize = max;
  }
  info.vData = [];
  for (var i = 0; i < filterSize; i++) {
    info.vData.push(0);
  }

  // The ideal number of hash functions is:
  // filter size * ln(2) / number of elements
  // See: https://github.com/bitcoin/bitcoin/blob/master/src/bloom.cpp
  var nHashFuncs = Math.floor(info.vData.length * 8 / elements * Filter.LN2);
  if (nHashFuncs > Filter.MAX_HASH_FUNCS) {
    nHashFuncs = Filter.MAX_HASH_FUNCS;
  }
  if (nHashFuncs < Filter.MIN_HASH_FUNCS) {
    nHashFuncs = Filter.MIN_HASH_FUNCS;
  }

  info.nHashFuncs = nHashFuncs;
  info.nTweak = nTweak;
  info.nFlags = nFlags;

  return new Filter(info);

};

Filter.prototype.hash = function hash(nHashNum, vDataToHash) {
  var h = MurmurHash3(((nHashNum * 0xFBA4C795) + this.nTweak) & 0xFFFFFFFF, vDataToHash);
  return h % (this.vData.length * 8);
};

Filter.prototype.insert = function insert(data) {
  for (var i = 0; i < this.nHashFuncs; i++) {
    var index = this.hash(i, data);
    var position = (1 << (7 & index));
    this.vData[index >> 3] |= position;
  }
  return this;
};

/**
 * @param {Buffer} Data to check if exists in the filter
 * @returns {Boolean} If the data matches
 */
Filter.prototype.contains = function contains(data) {
  if (!this.vData.length) {
    return false;
  }
  for (var i = 0; i < this.nHashFuncs; i++) {
    var index = this.hash(i, data);
    if (!(this.vData[index >> 3] & (1 << (7 & index)))) {
      return false;
    }
  }
  return true;
};

Filter.prototype.clear = function clear() {
  this.vData = [];
};

Filter.prototype.inspect = function inspect() {
  return '<BloomFilter:' +
    this.vData + ' nHashFuncs:' +
    this.nHashFuncs + ' nTweak:' +
    this.nTweak + ' nFlags:' +
    this.nFlags + '>';
};

Filter.BLOOM_UPDATE_NONE = 0;
Filter.BLOOM_UPDATE_ALL = 1;
Filter.BLOOM_UPDATE_P2PUBKEY_ONLY = 2;
Filter.MAX_BLOOM_FILTER_SIZE = 36000; // bytes
Filter.MAX_HASH_FUNCS = 50;
Filter.MIN_HASH_FUNCS = 1;
Filter.LN2SQUARED = Math.pow(Math.log(2), 2); // 0.4804530139182014246671025263266649717305529515945455
Filter.LN2 = Math.log(2); // 0.6931471805599453094172321214581765680755001343602552

module.exports = Filter;

},{"./murmurhash3":2}],2:[function(require,module,exports){
'use strict';

/**
 * MurmurHash is a non-cryptographic hash function suitable for general hash-based lookup
 *
 * @see https://en.wikipedia.org/wiki/MurmurHash
 * @see https://github.com/petertodd/python-bitcoinlib/blob/master/bitcoin/bloom.py
 * @see https://github.com/bitcoinj/bitcoinj/blob/master/core/src/main/java/org/bitcoinj/core/BloomFilter.java#L170
 * @see https://github.com/bitcoin/bitcoin/blob/master/src/hash.cpp
 * @see https://github.com/indutny/bcoin/blob/master/lib/bcoin/bloom.js
 * @see https://github.com/garycourt/murmurhash-js
 *
 * @param {Buffer} data to be hashed
 * @param {Number} seed Positive integer only
 * @return {Number} a 32-bit positive integer hash
*/
function MurmurHash3(seed, data) {
  /* jshint maxstatements: 32, maxcomplexity: 10 */

  var c1 = 0xcc9e2d51;
  var c2 = 0x1b873593;
  var r1 = 15;
  var r2 = 13;
  var m = 5;
  var n = 0x6b64e654;

  var hash = seed;

  function mul32(a, b) {
    return (a & 0xffff) * b + (((a >>> 16) * b & 0xffff) << 16) & 0xffffffff;
  }

  function sum32(a, b) {
    return (a & 0xffff) + (b >>> 16) + (((a >>> 16) + b & 0xffff) << 16) & 0xffffffff;
  }

  function rotl32(a, b) {
    return (a << b) | (a >>> (32 - b));
  }

  var k1;

  for (var i = 0; i + 4 <= data.length; i += 4) {
    k1 = data[i] |
      (data[i + 1] << 8) |
      (data[i + 2] << 16) |
      (data[i + 3] << 24);

    k1 = mul32(k1, c1);
    k1 = rotl32(k1, r1);
    k1 = mul32(k1, c2);

    hash ^= k1;
    hash = rotl32(hash, r2);
    hash = mul32(hash, m);
    hash = sum32(hash, n);
  }

  k1 = 0;

  switch(data.length & 3) {
    case 3:
      k1 ^= data[i + 2] << 16;
      /* falls through */
    case 2:
      k1 ^= data[i + 1] << 8;
      /* falls through */
    case 1:
      k1 ^= data[i];
      k1 = mul32(k1, c1);
      k1 = rotl32(k1, r1);
      k1 = mul32(k1, c2);
      hash ^= k1;
  }

  hash ^= data.length;
  hash ^= hash >>> 16;
  hash = mul32(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = mul32(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;

  return hash >>> 0;
}

module.exports = MurmurHash3;

},{}],"bloom-filter":[function(require,module,exports){
'use strict';

module.exports = {};
module.exports = require('./filter');
module.exports.MurmurHash3 = require('./murmurhash3');

},{"./filter":1,"./murmurhash3":2}]},{},[]);
