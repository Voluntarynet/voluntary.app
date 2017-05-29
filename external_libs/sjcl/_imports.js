
JSImporter.pushRelativePaths([
    "core/sjcl.js",
    "core/aes.js",
    "core/bitArray.js",
    "core/bn.js",
    "core/cbc.js",
    "core/ccm.js",
    "core/ccmArrayBuffer.js",
    "core/codecArrayBuffer.js",
    "core/codecBase32.js",
    "core/codecBase64.js",
    "core/codecBytes.js",
    "core/codecHex.js",
    "core/codecString.js",
    "core/codecZ85.js",
    "core/convenience.js",
    "core/ctr.js",
    "core/ecc.js",
    "core/exports.js",
    "core/gcm.js",
    "core/hkdf.js",
    "core/hmac.js",
    "core/ocb2.js",
    "core/ocb2progressive.js",
    "core/pbkdf2.js",
    "core/ripemd160.js",
    "core/scrypt.js",
    "core/sha1.js",
    "core/sha256.js",
    "core/sha512.js",
    "core/srp.js",
    "core/random.js",
])

JSImporter.pushDoneCallback( () => {
	sjcl.random.startCollectors();
})