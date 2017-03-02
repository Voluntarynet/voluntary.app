
// sjcl.codec.bits.leftZeroBitCount
sjcl.codec.bits = {

  toBitString: function (bitArray) {
     var bytes = sjcl.codec.bytes.fromBits(bitArray)
     var bits = []
     for (i = 0; i < bytes.length; i++) {
         var thisByte = bytes[i];
         for (b = 0; b < 8; b++) {
            if ((thisByte >> b) & 1) {
                bits.push(1)
            } else {
                bits.push(0)
            }
         }
    }
    return bits.join("");
  },
  
  leftZeroBitCount: function(bitArr) {
     var bytes = sjcl.codec.bytes.fromBits(bitArr)
     var count = 0;
     for (i = 0; i < bytes.length; i++) {
         var thisByte = bytes[i];
         for (b = 0; b < 8; b++) {
            if ((thisByte >> b) & 1) {
                return count
            }
            count ++;
         }
      }      
   },
   
};

  
sjcl.bitArray.xor = function(bitArr1, bitArr2) {
    var bytes1 = sjcl.codec.bytes.fromBits(bitArr1)
    var bytes2 = sjcl.codec.bytes.fromBits(bitArr2)
    var bytesOut = sjcl.codec.bytes.fromBits(bitArr1) // just to write over
    var count = 0;

    if (bytes1.length != bytes2.length) {
        throw "XOR: bit arrays of different size"
    }

    for (i = 0; i < bytes1.length; i++) {
        bytesOut[i] = bytes1[i] ^ bytes2[i]
    }      

    return sjcl.codec.bytes.toBits(bytesOut)
 }
   
   