const Bufo = require('./bufo');
const util = require('util');
const assert = require('assert');

const check = (a, b) => {
	assert(a === b, util.format('Expected: %s, got %s.', b, a));
};

let raw = [0xFF, 0xD2, 0xCE, 0xFE, 0x6F, 0x57, 0x6F, 0x72, 0x6C, 0x64];
let buf = Buffer.from(raw);

// Generics //
let a = new Bufo(buf);
check(a.raw, buf); // Internal buffer ref should match buf.
check(a.byteLength, buf.length); // byteLength should match buffer length.
check(a.offset, 0); // Offset instantiated as zero.
check(a.lastWriteOffset, 0); // lastWriteOffset instantiated as zero.
check(a.remainingBytes, buf.length); // Remaining bytes should match buffer length.

// Read Bytes //
for (let i = 0, r = buf.length; i < buf.length; i++, r--) {
	let byte = a.readUInt8();
	check(byte, raw[i]); // Bytes should match 1:1 with the input array here.
	check(a.offset, i + 1); // Offset should follow the loop index.
	check(a.remainingBytes, r - 1); // Remaining bytes decrements each time.
	check(a.lastWriteOffset, 0); // Last write offset should not be changing yet.
}

// Offset Management //
a.move(-5); check(a.offset, raw.length - 5); // Negative values traverse backward.
a.move(4); check(a.offset, raw.length - 1); // Positive values traverse forward.
a.seek(-7); check(a.offset, raw.length - 7); // Negative values seek from end back.
a.seek(0); check(a.offset, 0); // Positive values seek from front forward.

// Read Integers (Default Little Endian)
a.seek(0); check(a.readUInt8(), 255); // Int8, Unsigned
a.seek(0); check(a.readInt8(), -1); // Int8, Signed
a.seek(0); check(a.readUInt16(), 54015); // Int16, Unsigned
a.seek(0); check(a.readInt16(), -11521); // Int16, Signed
a.seek(0); check(a.readUInt32(), 4274967295); // Int32, Unsigned
a.seek(0); check(a.readInt32(), -20000001); // Int32, Signed

// Read Integers (Call-Specific Big Endian
a.seek(0); check(a.readUInt16(1, Bufo.ENDIAN_BIG), 65490); // Int16, Unsigned
a.seek(0); check(a.readInt16(1, Bufo.ENDIAN_BIG), -46); // Int16, Signed
a.seek(0); check(a.readUInt32(1, Bufo.ENDIAN_BIG), 4292005630); // Int32, Unsigned
a.seek(0); check(a.readInt32(1, Bufo.ENDIAN_BIG), -2961666); // Int32, Signed

// Read Integers (Switch to Big Endian)
a.setEndian(Bufo.ENDIAN_BIG);
a.seek(0); check(a.readUInt8(), 255); // Int8, Unsigned
a.seek(0); check(a.readInt8(), -1); // Int8, Signed
a.seek(0); check(a.readUInt16(), 65490); // Int16, Unsigned
a.seek(0); check(a.readInt16(), -46); // Int16, Signed
a.seek(0); check(a.readUInt32(), 4292005630); // Int32, Unsigned
a.seek(0); check(a.readInt32(), -2961666); // Int32, Signed

// Multi-Read //
a.seek(0);
let readBytes = a.readUInt8(a.byteLength); // Read all bytes.
for (let i = 0; i < readBytes.length; i++)
	check(readBytes[i], raw[i]); // Output should match original raw.

a.seek(0);
let expected = [65490, 52990, 28503, 28530, 27748];
readBytes = a.readUInt16(a.byteLength / 2); // Read all Int16
for (let i = 0; i < readBytes.length; i++)
	check(readBytes[i], expected[i]); // Output should match defined above.

a.seek(0);
expected = [4292005630, 1868001138];
readBytes = a.readUInt32(expected.length); // Read all Int32
for (let i = 0; i < readBytes.length; i++)
	check(readBytes[i], expected[i]); // Output should match defined above.

// Writing //
a.setEndian(Bufo.ENDIAN_LITTLE); // Revert endian.
a.seek(0); a.writeUInt8(0x48); // Write a byte at the start.
a.seek(0); check(a.readUInt8(), 0x48); // Read the byte back.

expected = [0x65, 0x6C, 0x6C]; // Write three bytes at offset 1.
a.seek(1); a.writeUInt8(expected); // Write as array.
a.seek(1);

for (let i = 0; i < expected.length; i++)
	check(a.readUInt8(), expected[i]); // Check bytes were written.

// Strings //
a.seek(0); check(a.readString(5), "Hello"); check(a.readString(5), "World"); // Basic strings.
a.seek(0); a.writeString("Frogs"); // Write a new string from the start.
a.seek(0); check(a.readString(10), "FrogsWorld"); // Check string was written and other bytes remained the same.
a.seek(0); a.writeString("Buzzzz", true); // Write a prefixed string.
a.seek(0); check(a.readUInt32(), 6); // Check string length was prefixed.
a.seek(0); check(a.readString(), "Buzzzz"); // Read length-prefixed string.
a.seek(0); a.writeUTF8String("こ", true); // Write UTF8 string (length prefixed).
a.seek(0); check(a.readUTF8String(), "こ"); // Read UTF8 string back (length prefixed).