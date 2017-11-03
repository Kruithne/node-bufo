/*!
	Bufo (https://github.com/Kruithne/node-bufo)
	Author: Kruithne <kruithne@gmail.com>
	License: MIT
 */

const NODE_BUFFER_SUPPORT = typeof Buffer === 'function';
const WEB_BUFFER_SUPPORT = typeof DataView === 'function' && typeof ArrayBuffer === 'function';

const ENDIAN_LITTLE = 0x1;
const ENDIAN_BIG = 0x2;

const TYPE_BUFFER = 0x1;
const TYPE_WEB = 0x2;

const TYPE_INT8 = 0x1;
const TYPE_UINT8 = 0x2;
const TYPE_INT16 = 0x3;
const TYPE_UINT16 = 0x4;
const TYPE_INT32 = 0x5;
const TYPE_UINT32 = 0x6;

const TYPE_SIZES = {
	[TYPE_INT8]: 1,
	[TYPE_UINT8]: 1,
	[TYPE_INT16]: 2,
	[TYPE_UINT16]: 2,
	[TYPE_INT32]: 4,
	[TYPE_UINT32]: 4
};

const READ_FUNCTION_SET = {
	[TYPE_BUFFER]: {
		[ENDIAN_LITTLE]: {
			[TYPE_INT8]: (buf, ofs) => Buffer.prototype.readInt8.call(buf, ofs),
			[TYPE_UINT8]: (buf, ofs) => Buffer.prototype.readUInt8.call(buf, ofs),
			[TYPE_INT16]: (buf, ofs) => Buffer.prototype.readInt16LE.call(buf, ofs),
			[TYPE_UINT16]: (buf, ofs) => Buffer.prototype.readUInt16LE.call(buf, ofs),
			[TYPE_INT32]: (buf, ofs) => Buffer.prototype.readInt32LE.call(buf, ofs),
			[TYPE_UINT32]: (buf, ofs) => Buffer.prototype.readUInt32LE.call(buf, ofs)
		},

		[ENDIAN_BIG]: {
			[TYPE_INT8]: (buf, ofs) => Buffer.prototype.readInt8.call(buf, ofs),
			[TYPE_UINT8]: (buf, ofs) => Buffer.prototype.readUInt8.call(buf, ofs),
			[TYPE_INT16]: (buf, ofs) => Buffer.prototype.readInt16BE.call(buf, ofs),
			[TYPE_UINT16]: (buf, ofs) => Buffer.prototype.readUInt16BE.call(buf, ofs),
			[TYPE_INT32]: (buf, ofs) => Buffer.prototype.readInt32BE.call(buf, ofs),
			[TYPE_UINT32]: (buf, ofs) => Buffer.prototype.readUInt32BE.call(buf, ofs)
		}
	},
	[TYPE_WEB]: {
		[ENDIAN_LITTLE]: {
			[TYPE_INT8]: (buf, ofs) => DataView.prototype.getInt8.call(buf, ofs),
			[TYPE_UINT8]: (buf, ofs) => DataView.prototype.getUint8.call(buf, ofs),
			[TYPE_INT16]: (buf, ofs) => DataView.prototype.getInt16.call(buf, ofs, true),
			[TYPE_UINT16]: (buf, ofs) => DataView.prototype.getUint16.call(buf, ofs, true),
			[TYPE_INT32]: (buf, ofs) => DataView.prototype.getInt32.call(buf, ofs, true),
			[TYPE_UINT32]: (buf, ofs) => DataView.prototype.getUint32.call(buf, ofs, true)
		},

		[ENDIAN_BIG]: {
			[TYPE_INT8]: (buf, ofs) => DataView.prototype.getInt8.call(buf, ofs),
			[TYPE_UINT8]: (buf, ofs) => DataView.prototype.getUint8.call(buf, ofs),
			[TYPE_INT16]: (buf, ofs) => DataView.prototype.getInt16.call(buf, ofs, false),
			[TYPE_UINT16]: (buf, ofs) => DataView.prototype.getUint16.call(buf, ofs, false),
			[TYPE_INT32]: (buf, ofs) => DataView.prototype.getInt32.call(buf, ofs, false),
			[TYPE_UINT32]: (buf, ofs) => DataView.prototype.getUint32.call(buf, ofs, false)
		}
	}
};

const WRITE_FUNCTION_SET = {
	[TYPE_BUFFER]: {
		[ENDIAN_LITTLE]: {
			[TYPE_INT8]: (buf, ofs, val) => Buffer.prototype.writeInt8.call(buf, val, ofs),
			[TYPE_UINT8]: (buf, ofs, val) => Buffer.prototype.writeUInt8.call(buf, val, ofs),
			[TYPE_INT16]: (buf, ofs, val) => Buffer.prototype.writeInt16LE.call(buf, val, ofs),
			[TYPE_UINT16]: (buf, ofs, val) => Buffer.prototype.writeUInt16LE.call(buf, val, ofs),
			[TYPE_INT32]: (buf, ofs, val) => Buffer.prototype.writeInt32LE.call(buf, val, ofs),
			[TYPE_UINT32]: (buf, ofs, val) => Buffer.prototype.writeUInt32LE.call(buf, val, ofs),
		},

		[ENDIAN_BIG]: {
			[TYPE_INT8]: (buf, ofs, val) => Buffer.prototype.writeInt8.call(buf, val, ofs),
			[TYPE_UINT8]: (buf, ofs, val) => Buffer.prototype.writeUInt8.call(buf, val, ofs),
			[TYPE_INT16]: (buf, ofs, val) => Buffer.prototype.writeInt16BE.call(buf, val, ofs),
			[TYPE_UINT16]: (buf, ofs, val) => Buffer.prototype.writeUInt16BE.call(buf, val, ofs),
			[TYPE_INT32]: (buf, ofs, val) => Buffer.prototype.writeInt32BE.call(buf, val, ofs),
			[TYPE_UINT32]: (buf, ofs, val) => Buffer.prototype.writeUInt32BE.call(buf, val, ofs),
		}
	},
	[TYPE_WEB]: {
		[ENDIAN_LITTLE]: {
			[TYPE_INT8]: (buf, ofs, val) => DataView.prototype.setInt8.call(buf, ofs, val),
			[TYPE_UINT8]: (buf, ofs, val) => DataView.prototype.setUint8.call(buf, ofs, val),
			[TYPE_INT16]: (buf, ofs, val) => DataView.prototype.setInt16.call(buf, ofs, val, true),
			[TYPE_UINT16]: (buf, ofs, val) => DataView.prototype.setUint16.call(buf, ofs, val, true),
			[TYPE_INT32]: (buf, ofs, val) => DataView.prototype.setInt32.call(buf, ofs, val, true),
			[TYPE_UINT32]: (buf, ofs, val) => DataView.prototype.setUint32.call(buf, ofs, val, true),
		},

		[ENDIAN_BIG]: {
			[TYPE_INT8]: (buf, ofs, val) => DataView.prototype.setInt8.call(buf, ofs, val),
			[TYPE_UINT8]: (buf, ofs, val) => DataView.prototype.setUint8.call(buf, ofs, val),
			[TYPE_INT16]: (buf, ofs, val) => DataView.prototype.setInt16.call(buf, ofs, val, false),
			[TYPE_UINT16]: (buf, ofs, val) => DataView.prototype.setUint16.call(buf, ofs, val, false),
			[TYPE_INT32]: (buf, ofs, val) => DataView.prototype.setInt32.call(buf, ofs, val, false),
			[TYPE_UINT32]: (buf, ofs, val) => DataView.prototype.setUint32.call(buf, ofs, val, false),
		}
	}
};

class Bufo {
	/**
	 * Create a new Bufo instance.
	 * @param {Buffer|Array|Bufo|String|ArrayBuffer|DataView|number} input
	 * @param {number} [defaultEncoding] Defaults to Bufo.ENDIAN_LITTLE
	 * @constructor
	 */
	constructor(input, defaultEncoding) {
		this._offset = 0;
		this._writeOffset = 0;
		this.setEndian(defaultEncoding || Bufo.ENDIAN_LITTLE);
		this._wrap(input);
	}

	/**
	 * Constant representing little-endian byte-order.
	 * @returns {number}
	 */
	static get ENDIAN_LITTLE() {
		return ENDIAN_LITTLE;
	}

	/**
	 * Constant representing big-endian byte-order.
	 * @returns {number}
	 */
	static get ENDIAN_BIG() {
		return ENDIAN_BIG;
	}

	/**
	 * Get the full capacity of the underlying buffer.
	 * @returns {number}
	 */
	get byteLength() {
		return this._buffer.byteLength;
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
	 * @returns {Buffer|DataView}
	 */
	get raw() {
		return this._buffer;
	}

	/**
	 * Set the raw internal buffer for this instance.
	 * @param {Buffer|DataView} input
	 */
	set raw(input) {
		if (NODE_BUFFER_SUPPORT && input instanceof Buffer) {
			this._internalType = TYPE_BUFFER;
		} else if (WEB_BUFFER_SUPPORT && input instanceof DataView) {
			this._internalType = TYPE_WEB;
		}

		this._buffer = input;
	}

	/**
	 * Set the default endian used by this instance.
	 * @param {number} endian Bufo.ENDIAN_LITTLE or Bufo.ENDIAN_BIG
	 */
	setEndian(endian) {
		if (endian !== Bufo.ENDIAN_LITTLE && endian !== Bufo.ENDIAN_BIG)
			Bufo._error('Invalid endian provided. Use Bufo.ENDIAN_LITTLE or Bufo.ENDIAN_BIG.');

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
			Bufo._error('seek() offset out of bounds ({0} > {1})', offset, this.byteLength);

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
			Bufo._error('move() offset out of bounds ({0})', check);

		this._offset = check;
	}

	/**
	 * Read one or more signed 8-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @returns {number|Array}
	 */
	readInt8(count) {
		return this._readInt(TYPE_INT8, count);
	}

	/**
	 * Read one or more unsigned 8-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @returns {number|Array}
	 */
	readUInt8(count) {
		return this._readInt(TYPE_UINT8, count);
	}

	/**
	 * Read one or more signed 16-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @param {number} [endian] Non-default endian to use.
	 * @returns {number|Array}
	 */
	readInt16(count, endian) {
		return this._readInt(TYPE_INT16, count, endian);
	}

	/**
	 * Read one or more unsigned 16-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @param {number} [endian] Non-default endian to use.
	 * @returns {number|Array}
	 */
	readUInt16(count, endian) {
		return this._readInt(TYPE_UINT16, count, endian);
	}

	/**
	 * Read one or more signed 32-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @param {number} [endian] Non-default endian to use.
	 * @returns {number|Array}
	 */
	readInt32(count, endian) {
		return this._readInt(TYPE_INT32, count, endian);
	}

	/**
	 * Read one or more unsigned 32-bit integers.
	 * @param {number} [count] How many integers to read.
	 * @param {number} [endian] Non-default endian to use.
	 * @returns {number|Array}
	 */
	readUInt32(count, endian) {
		return this._readInt(TYPE_UINT32, count, endian);
	}

	/**
	 * Read a string from the buffer.
	 * If length is omitted, will read a UInt32 as the length.
	 * @param {number|null} [length] Byte-length of the string.
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
	 * @param {number|null} [length] Byte-length of the string.
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
	 * @param {number|null} [length]
	 * @returns {Buffer}
	 */
	readBuffer(length) {
		if (!NODE_BUFFER_SUPPORT)
			return Bufo._error('readBuffer() called in environment without Buffer support.');

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
		let target = new Bufo(length);
		target.writeUInt8(this.readUInt8(length));
		return target;
	}

	/**
	 * Write one or more signed 8-bit integers.
	 * @param {number|Array} input
	 */
	writeInt8(input) {
		this._writeInt(TYPE_INT8, input);
	}

	/**
	 * Write one or more unsigned 8-bit integers.
	 * @param {number|Array} input
	 */
	writeUInt8(input) {
		this._writeInt(TYPE_UINT8, input);
	}

	/**
	 * Write one or more signed 16-bit integers.
	 * @param {number|Array} input Integer(s) to write.
	 * @param {number} [endian] Non-default endian to use.
	 */
	writeInt16(input, endian) {
		this._writeInt(TYPE_INT16, input, endian);
	}

	/**
	 * Write one or more unsigned 16-bit integers.
	 * @param {number|Array} input Integer(s) to write.
	 * @param {number} [endian] Non-default endian to use.
	 */
	writeUInt16(input, endian) {
		this._writeInt(TYPE_UINT16, input, endian);
	}

	/**
	 * Write one or more signed 32-bit integers.
	 * @param {number|Array} input Integer(s) to write.
	 * @param {number} [endian] Non-default endian to use.
	 */
	writeInt32(input, endian) {
		this._writeInt(TYPE_INT32, input, endian);
	}

	/**
	 * Write one or more unsigned 32-bit integers.
	 * @param {number|Array} input Integer(s) to write.
	 * @param {number} [endian] Non-default endian to use.
	 */
	writeUInt32(input, endian) {
		this._writeInt(TYPE_UINT32, input, endian);
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
	 * @param {number|null} [offset] Defaults to 0.
	 * @param {number|null} [count] Defaults to all available bytes.
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
		this._offset += count;
		this._writeOffset = this._offset;
	}

	/**
	 * Write the specified count of bytes to a file.
	 * @param {string} path
	 * @param {number|null} [count]
	 * @param {object|null} [options]
	 */
	toFile(path, count, options) {
		let stream = require('fs').createWriteStream(path, options);
		stream.write(this.readBuffer(count));
	}

	/**
	 * Read an integer from the internal buffer.
	 * @param {number} type Type of integer to read.
	 * @param {number} [count] Amount to read.
	 * @param {number} [endian] Non-default endian to use.
	 * @returns {number|Array}
	 * @private
	 */
	_readInt(type, count, endian) {
		let out;
		let size = TYPE_SIZES[type];
		let func = READ_FUNCTION_SET[this._internalType][endian || this._endian][type];

		count = count || 1;

		if (count > 1) {
			out = [];
			for (let i = 0; i < count; i++) {
				out[i] = func(this._buffer, this._offset);
				this._offset += size;
			}
		} else {
			out = func(this._buffer, this._offset);
			this._offset += size;
		}
		return out;
	}

	/**
	 * Write a type of data to the internal buffer.
	 * @param {number} type Type of integer to write.
	 * @param {number|Array} input Input to be written.
	 * @param {number} [endian] Non-default endian to use.
	 * @private
	 */
	_writeInt(type, input, endian) {
		let size = TYPE_SIZES[type];
		let func = WRITE_FUNCTION_SET[this._internalType][endian || this._endian][type];

		if (Array.isArray(input)) {
			for (let elem of input) {
				func(this._buffer, this._offset, elem);
				this._offset += size;
			}
		} else {
			func(this._buffer, this._offset, input);
			this._offset += size;
		}

		this._writeOffset = this._offset;
	}

	/**
	 * Wrap the given input side this instance.
	 * @param {Buffer|Array|Bufo|String|ArrayBuffer|DataView|number} input
	 * @private
	 */
	_wrap(input) {
		// Ensure we support at least something.
		if (!NODE_BUFFER_SUPPORT && !WEB_BUFFER_SUPPORT)
			Bufo._error('Cannot instantiate Bufo. No support for Buffer or DataView.');

		// If provided with a number, create a new buffer with that size.
		if (typeof input === 'number') {
			if (NODE_BUFFER_SUPPORT)
				this.raw = Buffer.alloc(input);
			else if (WEB_BUFFER_SUPPORT)
				this.raw = new DataView(new ArrayBuffer(input));

			return;
		}

		// NodeJS Buffer, wrap it normally.
		if (NODE_BUFFER_SUPPORT && input instanceof Buffer) {
			this.raw = input;
			return;
		}

		// ArrayBuffer, create a DataView for it.
		if (WEB_BUFFER_SUPPORT && input instanceof ArrayBuffer) {
			this.raw = new DataView(input);
			return;
		}

		// DataView, wrap it normally.
		if (WEB_BUFFER_SUPPORT && input instanceof DataView) {
			this.raw = input;
			return;
		}

		// Weird, but sometimes used to ensure a fresh instance.
		if (input instanceof Bufo) {
			this.raw = input.raw;
			return;
		}

		// Marshal the array to a supported binary type.
		if (Array.isArray(input)) {
			if (NODE_BUFFER_SUPPORT) {
				this.raw = Buffer.from(input);
			} else if (WEB_BUFFER_SUPPORT) {
				this.raw = new DataView(new ArrayBuffer(input.length));
				this.writeUInt8(input);
			}
			return;
		}

		// Not ideal, but handle strings naively.
		if (typeof input === 'string') {
			if (NODE_BUFFER_SUPPORT)
				this.raw = Buffer.alloc(input.length);
			else if (WEB_BUFFER_SUPPORT)
				this.raw = new DataView(new ArrayBuffer(input.length));

			for (let i = 0; i < input.length; i++)
				this.writeUInt8(input.charCodeAt(i));

			return;
		}

		Bufo._error('Unexpected input. Bufo accepts Buffer|Array|Bufo|String|DataView|ArrayBuffer.');
	}

	/**
	 * Static helper for throwing errors from Bufo.
	 * @param {string} message Error message.
	 * @param args
	 * @private
	 */
	static _error(message, ...args) {
		throw new Error('Bufo: ' + message.replace(/{(\d+)}/g, (match, number) => {
			return typeof args[number] !== 'undefined' ? args[number] : match;
		}));
	}
}

// Export to NodeJS.
if (typeof module === 'object' && typeof module.exports === 'object')
	module.exports = Bufo;