#jsbloom

[![Build Status](https://travis-ci.org/cry/jsbloom.svg?branch=master)](https://travis-ci.org/cry/jsbloom)

A fast bloom filter implementation in JavaScript using the djb2 and sdbm algorithms. 

From _Less Hashing, Same Performance: Building a Better Bloom Filter_ by Adam Kirsch et al, it is possible to build _k_ hash values from only _2_ unique values. Hence, it is sufficient to have two unique hashes generated.

### Usage

    var filter = new JSBloom(items, false_probability_chance);

    filter.addEntry("xyz");

    filter.checkEntry("xyz"); // returns true

    filter.checkEntry("yz"); // returns false

### Testing

Testing is done with mocha and chai

    npm install mocha chai
    mocha

### Parameters

    items: ceiling of entries to add
    false_probability_chance: chance of false positives to occur

    JSBloom will automatically generate the needed bit array and amount of hashes needed to meet your requirements.

### API reference

    addEntry(str): adds str to bloom filter
    addEntries(arr): iterates over arr and adds every entry within
    checkEntry(str): checks if str in filter, returns false if definitely not, true if maybe
    importData(base64, [number_of_hashes]): loads a base 64 LZW compressed Uint8Array
    exportData(): returns base 64 encoded Uint8Array LZW as string
    exportData(callback): returns the base 64 encoded Uint8Array LZW compressed to provided callback
