console.log("------ BEGIN TESTS ------")


//var bitcore = require('bitcore');

var bitcore = require('bitcore-lib');
var ECIES = require('bitcore-ecies');

var Buffer = bitcore.deps.Buffer;

var alicePrivateKey = new bitcore.PrivateKey();
var bobPrivateKey = new bitcore.PrivateKey();

var alice = ECIES().privateKey(alicePrivateKey).publicKey(bobPrivateKey.publicKey);

var message = 'some secret message';
var encrypted = alice.encrypt(message);

// encrypted will contain an encrypted buffer only Bob can decrypt

var bob = ECIES().privateKey(bobPrivateKey).publicKey(alicePrivateKey.publicKey);
var decrypted = bob.decrypt(encrypted).toString();

console.log("'" + decrypted + "' " + ((decrypted == message) ? "==" : "!=" ) + " '" + message + "'")

// decrypted will be 'some secret message'
console.log("------ END TESTS ------")

/*
var bitcore = require('bitcore-lib');
var ECIES = require('bitcore-ecies');
var Buffer = bitcore.Buffer;

var alicePrivateKey = new bitcore.PrivateKey();
var bobPrivateKey = new bitcore.PrivateKey();

var data = new Buffer('The is a raw data example');

// Encrypt data
var cypher1 = ECIES.privateKey(alicePrivateKey).publicKey(bobPrivateKey.publicKey);
var encrypted = cypher1.encrypt(data);

// Decrypt data
var cypher2 = ECIES.privateKey(bobPrivateKey).publicKey(alicePrivateKey.publicKey);
var decrypted = cypher2.decrypt(encrypted);

assert(data.toString(), decrypted.toString());
*/

/*
//netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserWrite');

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

window.requestFileSystem(
  PERSISTENT,        // persistent vs. temporary storage
  1024 * 1024,      // 1MB. Size (bytes) of needed space
  initFs,           // success callback
  opt_errorHandler  // opt. error callback, denial of access
);

function opt_errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('>>>> Error: ' + msg);
}
function initFs(fs) {
	console.log(">>>> initFs ")
  	fs.root.getFile('logFile.txt', {create: true}, GetFileWriter, errorHandler);
}


function GetFileWriter (fileEntry) {
	
	console.log(">>>> GetFileWriter ")
	
    fileEntry.createWriter(function(writer) {  // FileWriter

		writer.onwrite = function(e) {
			console.log('>>>> Write completed.');
		};

		writer.onerror = function(e) {
			console.log('>>>>  Write failed: ' + e.toString());
		};

		var bb = new BlobBuilder();
		bb.append('Lorem ipsum');
		writer.write(bb.getBlob('text/plain'));
    })
}
*/


/*
var shaObj = new jsSHA("SHA-256", "TEXT");
shaObj.update("This is a test");
var hash = shaObj.getHash("HEX");
console.log("hash = [" + hash + "]")
*/

/*
function TestsRun() {
    // wait until an ECIES javascript library that works in the browser is available
    TestSHA();
    TestElGamalEncryptDecrypt();
    TestSig2();
    TestSerializedKeys();
}

function TestSHA() {
    var shaBits = sjcl.hash.sha256.hash("test");
    var shaHex = sjcl.codec.hex.fromBits(shaBits);
    assert(shaHex == "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08")		        
    console.log("TestSHA passed")
}

function TestElGamalEncryptDecrypt() {
    var pair = sjcl.ecc.elGamal.generateKeys(256)
    var inputPlainText = "Hello World!"
    
    var cipherText = sjcl.encrypt(pair.pub, inputPlainText)
    var outputPlainText = sjcl.decrypt(pair.sec, cipherText)
    assert(outputPlainText == inputPlainText)		        
    //console.log("encryption test cipherText: [" + cipherText + "]")
    console.log("encryption test outputPlainText: [" + outputPlainText + "]")
    console.log("TestSig TestElGamalEncryptDecrypt")
}

function TestSig() {
    // Must be ECDSA!
    var pair = sjcl.ecc.ecdsa.generateKeys(256)
    var inputPlainText = "Hello World!"
    
    var sig = pair.sec.sign(sjcl.hash.sha256.hash(inputPlainText))
    // [ 799253862, -791427911, -170134622, ... ]

    var ok = pair.pub.verify(sjcl.hash.sha256.hash(inputPlainText), sig)
    // Either `true` or an error will be thrown.
    assert(ok == true)		        
    console.log("TestSig passed")
}

function TestSig2() {
    // Must be ECDSA!
    var pair = sjcl.ecc.ecdsa.generateKeys(256)
    var inputPlainText = "Hello World!"
    var cipherText = sjcl.encrypt(pair.pub, inputPlainText)
    
    
    /*
    var sig = pair.sec.sign(sjcl.hash.sha256.hash(inputPlainText))
    // [ 799253862, -791427911, -170134622, ...

    var ok = pair.pub.verify(sjcl.hash.sha256.hash(inputPlainText), sig)
    // Either `true` or an error will be thrown.
    assert(ok == true)		        
    console.log("TestSig passed")
}


function TestSerializedKeys() {
    var pair = sjcl.ecc.elGamal.generateKeys(256);
    var pub = pair.pub.get();
    var sec = pair.sec.get();
    //var codec = sjcl.codec.z85;
    var codec = sjcl.codec.hex;
    
    // Serialized public key:
    var serializedPub = codec.fromBits(pub.x.concat(pub.y))
    console.log("serializedPub: [" + serializedPub + "]")
    
    // Unserialized public key:
    var unserializedPub = new sjcl.ecc.elGamal.publicKey(
        sjcl.ecc.curves.c256, 
        codec.toBits(serializedPub)
    )
    console.log("unserializedPub: [", unserializedPub, "]")
    //assert( unserializedPub.equals(pub) )         

    // Serialized private key:
    var serializedSec = codec.fromBits(sec)
    console.log("serializedSec: [" + serializedSec + "]")

    // Unserialized private key:
    var unserializedSec = new sjcl.ecc.elGamal.secretKey(
        sjcl.ecc.curves.c256,
        sjcl.ecc.curves.c256.field.fromBits(codec.toBits(serializedSec))
    )
    console.log("unserializedSec: [", unserializedSec, "]")
    //assert( unserializedSec.equals(sec) )         
}
*/