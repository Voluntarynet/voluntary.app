var expect = require('chai').expect,
    ecc = require('../');

describe('ecc >', function() {

  describe('encrypt/decrypt >', function() {
    // Generate (or load) encryption/decryption keys 
    var keys = ecc.generate(ecc.ENC_DEC);
    var plaintext = "hello world!";
    var cipher = ecc.encrypt(keys.enc, plaintext);
    var result = ecc.decrypt(keys.dec, cipher);

    it("should work", function() {
      expect(result).to.equal(plaintext);
    });
  });

  describe('sign/verify >', function() {

    // Generate (or load) sign/verify keys 
    var keys = ecc.generate(ecc.SIG_VER);
    // => { dec: "192e35a51dc....", enc: "192037..." }

    // An important message
    var message = "hello world!";

    // Create digital signature
    var signature = ecc.sign(keys.sig, message);

    // Verify matches the text

    it("should work", function() {
      var result = ecc.verify(keys.ver, signature, message);
      expect(result).to.equal(true);
    });

    it("should NOT work", function() {
      var result = ecc.verify(keys.ver, signature, "hello Wor1d!");
      expect(result).to.equal(false);
    });

  });


});
