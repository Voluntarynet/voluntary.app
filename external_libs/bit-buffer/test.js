var assert = require('assert'),
	BitView = require('./bit-buffer').BitView,
	BitStream = require('./bit-buffer').BitStream;

suite('BitBuffer', function () {
	var array, bv, bsw, bsr;

	setup(function () {
		array = new ArrayBuffer(64);
		bv = new BitView(array);
		bsw = new BitStream(bv);
		// Test initializing straight from the array.
		bsr = new BitStream(array);
	});

	test('Min / max signed 5 bits', function () {
		var signed_max = (1 << 4) - 1;

		bsw.writeBits(signed_max, 5);
		bsw.writeBits(-signed_max - 1, 5);
		assert(bsr.readBits(5, true) === signed_max);
		assert(bsr.readBits(5, true) === -signed_max - 1);
	});

	test('Min / max unsigned 5 bits', function () {
		var unsigned_max = (1 << 5) - 1;

		bsw.writeBits(unsigned_max, 5);
		bsw.writeBits(-unsigned_max, 5);
		assert(bsr.readBits(5) === unsigned_max);
		assert(bsr.readBits(5) === 1);
	});

	test('Min / max int8', function () {
		var signed_max = 0x7F;

		bsw.writeInt8(signed_max);
		bsw.writeInt8(-signed_max - 1);
		assert(bsr.readInt8() === signed_max);
		assert(bsr.readInt8() === -signed_max - 1);
	});

	test('Min / max uint8', function () {
		var unsigned_max = 0xFF;

		bsw.writeUint8(unsigned_max);
		bsw.writeUint8(-unsigned_max);
		assert(bsr.readUint8() === unsigned_max);
		assert(bsr.readUint8() === 1);
	});

	test('Min / max int16', function () {
		var signed_max = 0x7FFF;

		bsw.writeInt16(signed_max);
		bsw.writeInt16(-signed_max - 1);
		assert(bsr.readInt16() === signed_max);
		assert(bsr.readInt16() === -signed_max - 1);
	});

	test('Min / max uint16', function () {
		var unsigned_max = 0xFFFF;

		bsw.writeUint16(unsigned_max);
		bsw.writeUint16(-unsigned_max);
		assert(bsr.readUint16() === unsigned_max);
		assert(bsr.readUint16() === 1);
	});

	test('Min / max int32', function () {
		var signed_max = 0x7FFFFFFF;

		bsw.writeInt32(signed_max);
		bsw.writeInt32(-signed_max - 1);
		assert(bsr.readInt32() === signed_max);
		assert(bsr.readInt32() === -signed_max - 1);
	});

	test('Min / max uint32', function () {
		var unsigned_max = 0xFFFFFFFF;

		bsw.writeUint32(unsigned_max);
		bsw.writeUint32(-unsigned_max);
		assert(bsr.readUint32() === unsigned_max);
		assert(bsr.readUint32() === 1);
	});

	test('Unaligned reads', function () {
		bsw.writeBits(13, 5);
		bsw.writeUint8(0xFF);
		bsw.writeBits(14, 5);

		assert(bsr.readBits(5) === 13);
		assert(bsr.readUint8() === 0xFF);
		assert(bsr.readBits(5) === 14);
	});

	test('Min / max float32 (normal values)', function () {
		var scratch = new DataView(new ArrayBuffer(8));

		scratch.setUint32(0, 0x00800000);
		scratch.setUint32(4, 0x7f7fffff);

		var min = scratch.getFloat32(0);
		var max = scratch.getFloat32(4);

		bsw.writeFloat32(min);
		bsw.writeFloat32(max);

		assert(bsr.readFloat32() === min);
		assert(bsr.readFloat32() === max);
	});

	test('Min / max float64 (normal values)', function () {
		var scratch = new DataView(new ArrayBuffer(16));

		scratch.setUint32(0, 0x00100000);
		scratch.setUint32(4, 0x00000000);
		scratch.setUint32(8, 0x7fefffff);
		scratch.setUint32(12, 0xffffffff);

		var min = scratch.getFloat64(0);
		var max = scratch.getFloat64(8);

		bsw.writeFloat64(min);
		bsw.writeFloat64(max);

		assert(bsr.readFloat64() === min);
		assert(bsr.readFloat64() === max);
	});

	test('Overwrite previous value with 0', function () {
		bv.setUint8(0, 13);
		bv.setUint8(0, 0);

		assert(bv.getUint8(0) === 0);
	});

	test('Read / write ASCII string, fixed length', function () {
		var str = 'foobar';
		var len = 16;

		bsw.writeASCIIString(str, len);
		assert(bsw.byteIndex === len);

		assert(bsr.readASCIIString(len) === str);
		assert(bsr.byteIndex === len);
	});

	test('Read / write ASCII string, unknown length', function () {
		var str = 'foobar';

		bsw.writeASCIIString(str);
		assert(bsw.byteIndex === str.length + 1);  // +1 for 0x00

		assert(bsr.readASCIIString() === str);
		assert(bsr.byteIndex === str.length + 1);
	});

	test('Read ASCII string, 0 length', function () {
		var str = 'foobar';

		bsw.writeASCIIString(str);
		assert(bsw.byteIndex === str.length + 1);  // +1 for 0x00

		assert(bsr.readASCIIString(0) === '');
		assert(bsr.byteIndex === 0);
	});

	test('Read overflow', function () {
		var exception = false;

		try {
			bsr.readASCIIString(128);
		} catch (e) {
			exception = true;
		}

		assert(exception);
	});

	test('Write overflow', function () {
		var exception = false;

		try {
			bsw.writeASCIIString('foobar', 128);
		} catch (e) {
			exception = true;
		}

		assert(exception);
	});

	test('Get boolean', function () {
		bv.setUint8(0, 1);

		assert(bv.getBoolean(0));

		bv.setUint8(0, 0);
		assert(!bv.getBoolean(0));
	});

	test('Set boolean', function () {
		bv.setBoolean(0, true);

		assert(bv.getBoolean(0));

		bv.setBoolean(0, false);

		assert(!bv.getBoolean(0));
	});

	test('Read boolean', function () {
		bv.setBits(0, 1, 1);
		bv.setBits(1, 0, 1);

		assert(bsr.readBoolean());
		assert(!bsr.readBoolean());
	});

	test('Write boolean', function () {
		bsr.writeBoolean(true);
		assert(bv.getBits(0, 1, false) === 1);
		bsr.writeBoolean(false);
		assert(bv.getBits(1, 1, false) === 0);
	});

	test('Read / write UTF8 string, only ASCII characters', function () {
		var str = 'foobar';

		bsw.writeUTF8String(str);
		assert(bsw.byteIndex === str.length + 1);  // +1 for 0x00

		assert(bsr.readUTF8String() === str);
		assert(bsr.byteIndex === str.length + 1);
	});

	test('Read / write UTF8 string, non ASCII characters', function () {
		var str = '日本語';

		var bytes = [
			0xE6,
			0x97,
			0xA5,
			0xE6,
			0x9C,
			0xAC,
			0xE8,
			0xAA,
			0x9E
		];

		bsw.writeUTF8String(str);

		for (var i = 0; i < bytes.length; i++) {
			assert.equal(bytes[i], bv.getBits(i * 8, 8));
		}

		assert.equal(bsw.byteIndex, bytes.length + 1);  // +1 for 0x00

		assert.equal(str, bsr.readUTF8String());
		assert.equal(bsr.byteIndex, bytes.length + 1);
	});

	test('readBitStream', function () {
		bsw.writeBits(0xF0, 8); //0b11110000
		bsw.writeBits(0xF1, 8); //0b11110001
		bsr.readBits(3); //offset
		var slice = bsr.readBitStream(8);
		assert.equal(slice.readBits(6), 0x3E); //0b111110
		assert.equal(9, slice._index);
		assert.equal(6, slice.index);
		assert.equal(8, slice.length);
		assert.equal(2, slice.bitsLeft);

		assert.equal(bsr._index, 11);
		assert.equal((64 * 8) - 11, bsr.bitsLeft);
	});

	test('readBitStream overflow', function () {
		bsw.writeBits(0xF0, 8); //0b11110000
		bsw.writeBits(0xF1, 8); //0b11110001
		bsr.readBits(3); //offset
		var slice = bsr.readBitStream(4);

		var exception = false;

		try {
			slice.readUint8();
		} catch (e) {
			exception = true;
		}

		assert(exception);
	});

	test('readArrayBuffer', function () {
		bsw.writeBits(0xF0, 8); //0b11110000
		bsw.writeBits(0xF1, 8); //0b11110001
		bsw.writeBits(0xF0, 8); //0b11110000
		bsr.readBits(3); //offset

		var buffer = bsr.readArrayBuffer(2);

		assert.equal(0x3E, buffer[0]); //0b00111110
		assert.equal(0x1E, buffer[1]); //0b00011110

		assert.equal(3 + (2 * 8), bsr._index);
	});

	test('Get buffer from view', function() {
		bv.setBits(0, 0xFFFFFFFF, 32);
		var buffer = bv.buffer;

		assert.equal(64, buffer.length);
		assert.equal(0xFFFF, buffer.readUInt16LE(0));
	});

	test('Get buffer from stream', function () {
		bsw.writeBits(0xFFFFFFFF, 32);
		var buffer = bsr.buffer;

		assert.equal(64, buffer.length);
		assert.equal(0xFFFF, buffer.readUInt16LE(0));
	});
});
