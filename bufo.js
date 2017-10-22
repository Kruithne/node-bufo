/*! Bufo v1.0.0 (C) 2017 Kruithne <kruithne@gmail.com> MIT license */

const util = require('util');

class Bufo {
	/**
	 * Create a new Bufo instance.
	 * @param {Buffer|Array|Bufo|String} buffer
	 * @param {number} [defaultEncoding] Defaults to Bufo.ENDIAN_LITTLE
	 * @constructor
	 */
	constructor(buffer, defaultEncoding) {
		this._offset = 0;
		this._writeOffset = 0;
		this.setEndian(defaultEncoding || Bufo.ENDIAN_LITTLE);

		if (buffer instanceof Buffer) {
			// A nice, simple buffer.
			this._buffer = buffer;
		} else if (buffer instanceof Bufo) {
			// This is weird, but we handle it anyway.
			this._buffer = buffer.raw;
		} else if (Array.isArray(buffer)) {
			// Marshal byte-array to a buffer.
			this._buffer = Buffer.from(buffer);
		} else if (typeof buffer === 'string') {
			// Not ideal, but handle strings naively.
			this._buffer = Buffer.alloc(buffer.length);
			for (let i = 0; i < buffer.length; i++)
				this.writeUInt8(buffer.charCodeAt(i));
		} else {
			throw new Error('Unexpected input. Bufo accepts Buffer|Array|Bufo|String.');
		}
	}

	/**
	 * Constant representing little-endian byte-order.
	 * @returns {number}
	 */
	static get ENDIAN_LITTLE() {
		return 0x1;
	}

	/**
	 * Constant representing big-endian byte-order.
	 * @returns {number}
	 */
	static get ENDIAN_BIG() {
		return 0x2;
	}

	/**
	 * Get the full capacity of the underlying buffer.
	 * @returns {number}
	 */
	get byteLength() {
		return this._buffer.length;
	}

	/**
	 * Get the amount of bytes between the offset and the end of the buffer.
	 * @returns {number}
	 */
	get remainingBytes() {
		return this.byteLength - this.offset;
	}

	/**
	 * Get the current offset of this instance.
	 * @returns {number}
	 */
	get offset() {
		return this._offset;
	}

	/**
	 * Get the last write offset of this instance.
	 * @returns {number}
	 */
	get lastWriteOffset() {
		return this._writeOffset;
	}

	/**
	 * Get the raw internal buffer for this instance.
	 * @returns {Buffer}
	 */
	get raw() {
		return this._buffer;
	}

	/**
	 * Set the default endian used by this instance.
	 * @param {number} endian Bufo.ENDIAN_LITTLE or Bufo.ENDIAN_BIG
	 */
	setEndian(endian) {
		if (endian !== Bufo.ENDIAN_LITTLE && endian !== Bufo.ENDIAN_BIG)
			throw new Error('Invalid endian provided. Use Bufo.ENDIAN_LITTLE or Bufo.ENDIAN_BIG.');

		this._endian = endian;
	}

	/**
	 * Set the absolute position of this instance.
	 * Negative values will seek in reverse from the end of the buffer.
	 * @param {number} offset
	 */
	seek(offset) {
		let offsetLen = Math.abs(offset);
		if (offsetLen >= this.byteLength)
			throw new Error(util.format('seek() offset out of bounds (%d > %d).', offset, this.byteLength));

		if (offset < 0)
			this._offset = this.byteLength - offsetLen;
		else
			this._offset = offset;
	}

	/**
	 * Shift the offset of the instance in a relative manner.
	 * Positive values go forward, negative go back.
	 * @param offset
	 */
	move(offset) {
		let check = this._offset + offset;
		if (check < 0 || check >= this.byteLength)
			throw new Error(util.format('move() offset out of bounds (%d)', check));

		this._offset = check;
	}

	/**
	 * Read one or more signed 8-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @returns {number|Array}
	 */
	readInt8(count) {
		return this._read(this._buffer.readInt8, 1, count);
	}

	/**
	 * Read one or more unsigned 8-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @returns {number|Array}
	 */
	readUInt8(count) {
		return this._read(this._buffer.readUInt8, 1, count);
	}

	/**
	 * Read one or more signed 16-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @param {number} [endian] Non-default endian to use.
	 * @returns {number|Array}
	 */
	readInt16(count, endian) {
		return this._readInteger(this._buffer.readInt16LE, this._buffer.readInt16BE, 2, count, endian);
	}

	/**
	 * Read one or more unsigned 16-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @param {number} [endian] Non-default endian to use.
	 * @returns {number|Array}
	 */
	readUInt16(count, endian) {
		return this._readInteger(this._buffer.readUInt16LE, this._buffer.readUInt16BE, 2, count, endian);
	}

	/**
	 * Read one or more signed 32-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @param {number} [endian] Non-default endian to use.
	 * @returns {number|Array}
	 */
	readInt32(count, endian) {
		return this._readInteger(this._buffer.readInt32LE, this._buffer.readInt32BE, 4, count, endian);
	}

	/**
	 * Read one or more unsigned 32-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @param {number} [endian] Non-default endian to use.
	 * @returns {number|Array}
	 */
	readUInt32(count, endian) {
		return this._readInteger(this._buffer.readUInt32LE, this._buffer.readUInt32BE, 4, count, endian);
	}

	/**
	 * Read a string from the buffer.
	 * If length is omitted, will read a UInt32 as the length.
	 * @param {number} [length] Byte-length of the string.
	 * @returns {string}
	 */
	readString(length) {
		if (length === undefined || length === null)
			length = this.readUInt32();

		let bytes = this.readUInt8(length);
		if (length === 1)
			bytes = [bytes];

		for (let i = 0; i < bytes.length; i++)
			bytes[i] = String.fromCharCode(bytes[i]);

		return bytes.join('');
	}

	/**
	 * Read a UTF8 string from the buffer.
	 * If length is omitted, will read a UInt32 as the length.
	 * @param {number} [length] Byte-length of the string.
	 * @returns {string}
	 */
	readUTF8String(length) {
		if (length === undefined || length === null)
			length = this.readUInt32();

		let bytes = this.readUInt8(length);
		if (length === 1)
			bytes = [bytes];

		let out = [], pos = 0, c = 0;
		while (pos < bytes.length) {
			let c1 = bytes[pos++];
			if (c1 < 128) {
				out[c++] = String.fromCharCode(c1);
			} else if (c1 > 191 && c1 < 224) {
				let c2 = bytes[pos++];
				out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
			} else if (c1 > 239 && c1 < 365) {
				let c2 = bytes[pos++];
				let c3 = bytes[pos++];
				let c4 = bytes[pos++];
				let u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 0x10000;
				out[c++] = String.fromCharCode(0xD800 + (u >> 10));
				out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
			} else {
				let c2 = bytes[pos++];
				let c3 = bytes[pos++];
				out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
			}
		}

		return out.join('');
	}

	/**
	 * Read a buffer from this buffer.
	 * If length is omitted, will read all remaining bytes into the buffer.
	 * @param {number} [length]
	 * @returns {Buffer}
	 */
	readBuffer(length) {
		if (length === undefined || length === null)
			length = this.remainingBytes;

		let buffer = Buffer.alloc(length);
		this._buffer.copy(buffer, 0, this._offset, this._offset + length);
		this._offset += length;
		return buffer;
	}

	/**
	 * Read a Bufo-wrapped buffer from this buffer.
	 * If length is omitted, will read all remaining bytes into the buffer.
	 * @param {number} [length]
	 * @returns {Bufo}
	 */
	readBufo(length) {
		return new Bufo(this.readBuffer(length));
	}

	/**
	 * Write one or more signed 8-bit integers.
	 * @param {number|Array} input
	 */
	writeInt8(input) {
		this._write(this._buffer.writeInt8, input, 1);
	}

	/**
	 * Write one or more unsigned 8-bit integers.
	 * @param {number|Array} input
	 */
	writeUInt8(input) {
		this._write(this._buffer.writeUInt8, input, 1);
	}

	/**
	 * Write one or more signed 16-bit integers.
	 * @param {number|Array} input Integer(s) to write.
	 * @param {number} [endian] Non-default endian to use.
	 */
	writeInt16(input, endian) {
		this._writeInteger(this._buffer.writeInt16LE, this._buffer.writeInt16BE, input, 2, endian);
	}

	/**
	 * Write one or more unsigned 16-bit integers.
	 * @param {number|Array} input Integer(s) to write.
	 * @param {number} [endian] Non-default endian to use.
	 */
	writeUInt16(input, endian) {
		this._writeInteger(this._buffer.writeUInt16LE, this._buffer.writeUInt16BE, input, 2, endian);
	}

	/**
	 * Write one or more signed 32-bit integers.
	 * @param {number|Array} input Integer(s) to write.
	 * @param {number} [endian] Non-default endian to use.
	 */
	writeInt32(input, endian) {
		this._writeInteger(this._buffer.writeInt32LE, this._buffer.writeInt32BE, input, 4, endian);
	}

	/**
	 * Write one or more unsigned 32-bit integers.
	 * @param {number|Array} input Integer(s) to write.
	 * @param {number} [endian] Non-default endian to use.
	 */
	writeUInt32(input, endian) {
		this._writeInteger(this._buffer.writeUInt32LE, this._buffer.writeUInt32BE, input, 4, endian);
	}

	/**
	 * Write a string to the buffer.
	 * @param {string} str
	 * @param {boolean} [prefix] If true, will prefix with string length.
	 */
	writeString(str, prefix) {
		let out = [];
		for (let i = 0; i < str.length; i++)
			out[i] = str.charCodeAt(i);

		if (prefix)
			this.writeUInt32(out.length);

		this.writeUInt8(out);
	}

	/**
	 * Write a UTF8 encoded string to the buffer.
	 * @param {string} str String to write.
	 * @param {boolean} [prefix] If true, will prefix with string length.
	 */
	writeUTF8String(str, prefix) {
		let out = [], p = 0;
		for (let i = 0; i < str.length; i++) {
			let c = str.charCodeAt(i);
			if (c < 128) {
				out[p++] = c;
			} else if (c < 2048) {
				out[p++] = (c >> 6) | 192;
				out[p++] = (c & 63) | 128;
			} else if (((c & 0xFC00) === 0xD800) && (i + 1) < str.length && ((str.charCodeAt(i + 1) & 0xFC00) === 0xDC00)) {
				c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
				out[p++] = (c >> 18) | 240;
				out[p++] = ((c >> 12) & 63) | 128;
				out[p++] = ((c >> 6) & 63) | 128;
				out[p++] = (c & 63) | 128;
			} else {
				out[p++] = (c >> 12) | 224;
				out[p++] = ((c >> 6) & 63) | 128;
				out[p++] = (c & 63) | 128;
			}
		}

		if (prefix)
			this.writeUInt32(out.length);

		this.writeUInt8(out);
	}

	/**
	 * Write the contents of a buffer (or Bufo instance) to this buffer.
	 * @param {Buffer|Bufo} buffer
	 * @param {number} [offset] Defaults to 0.
	 * @param {number} [count] Defaults to all available bytes.
	 */
	writeBuffer(buffer, offset, count) {
		if (buffer instanceof Bufo) {
			offset = offset || buffer.offset;
			if (count === undefined || count === null)
				count = buffer.remainingBytes;

			buffer = buffer.raw;
		} else {
			offset = offset || 0;
			if (count === undefined || count === null)
				count = buffer.length - offset;
		}

		buffer.copy(this._buffer, this._offset, offset, offset + count);
	}

	/**
	 * Allocate a new Bufo-wrapped buffer.
	 * @param {number} size
	 * @param {boolean} [safe]
	 * @param {number} [endian]
	 */
	static create(size, safe, endian) {
		return new Bufo((safe ? Buffer.alloc : Buffer.allocUnsafe)(size), endian);
	}

	/**
	 * Read an integer from the internal buffer.
	 * @param {function} littleFunc
	 * @param {function} bigFunc Big-endian
	 * @param {number} size Size of integer type.
	 * @param {number} count Amount of integers to read.
	 * @param {number} [endian] Call-specific endian.
	 * @returns {number|Array}
	 * @private
	 */
	_readInteger(littleFunc, bigFunc, size, count, endian) {
		endian = endian || this._endian;
		return this._read(endian === Bufo.ENDIAN_LITTLE ? littleFunc : bigFunc, size, count);
	}

	/**
	 * Read a type of data from the internal buffer.
	 * @param {function} func Reference to a buffer read function.
	 * @param {number} size Size of the data type.
	 * @param {number} [count] Amount to read.
	 * @returns {number|Array}
	 * @private
	 */
	_read(func, size, count) {
		let out;
		count = count || 1;
		if (count > 1) {
			out = [];
			for (let i = 0; i < count; i++) {
				out[i] = func.call(this._buffer, this._offset);
				this._offset += size;
			}
		} else {
			out = func.call(this._buffer, this._offset);
			this._offset += size;
		}
		return out;
	}

	/**
	 * Write an integer to the internal buffer.
	 * @param {function} littleFunc
	 * @param {function} bigFunc
	 * @param {number|Array} input
	 * @param {number} size
	 * @param {number} [endian]
	 * @private
	 */
	_writeInteger(littleFunc, bigFunc, input, size, endian) {
		endian = endian || this._endian;
		this._write(endian === Bufo.ENDIAN_LITTLE ? littleFunc : bigFunc, input, size);
	}

	/**
	 * Write a type of data to the internal buffer.
	 * @param {function} func Reference to the buffer write function.
	 * @param {number|Array} input Input to be written.
	 * @param {number} size Byte size of the data-type.
	 * @private
	 */
	_write(func, input, size) {
		if (Array.isArray(input)) {
			for (let elem of input) {
				func.call(this._buffer, elem, this._offset);
				this._offset += size;
			}
		} else {
			func.call(this._buffer, input, this._offset);
			this._offset += size;
		}

		this._writeOffset = this._offset;
	}
}

module.exports = Bufo;