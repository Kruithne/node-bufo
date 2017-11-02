# Bufo - Buffer utility for ES6
In a world filled with Buffer related packages, this is nothing but another fish in the ocean. Bufo acts as a wrapper for the Buffer class, providing position-aware reading utility.

If you're wondering about the origin of the name, this package was named after a frog in World of Warcraft.

## Installing (Node)
```
npm install bufo
```

## Installing (Browser)
```
<script src="bufo.js"></script>
```

## Example (Creation)
```javascript
// Create a Bufo instance providing nothing more than a size...
let data = new Bufo(10);

// Using an exisitng NodeJS buffer...
let buffer = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21]);
let data = new Bufo(buffer);

// Using a string, if you felt like it...
let data = new Bufo('\u00bd\u00bc\u00be');

// Using a native array filled with bytes...
let data = new Bufo([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21]);

// .. And more! Check the documentation for all options.
```

## Example (Usage)
```javascript
data.readUInt8(); // -> 0x48
data.readUInt8(); // -> 0x65
data.move(-2); // Back to the start we go...
data.readString(); // -> Hello, world!
```

## API

### `Bufo.ENDIAN_LITTLE`
Static constant representing the little-endian byte-order. Can be provided to the constructor to set the default endianness, or to individual integer read/write calls to over-write the default endianness for that call.

### `Bufo.ENDIAN_BIG`
Static constant representing the big-endian byte-order. Can be provided to the constructor to set the default endianness, or to individual integer read/write calls to over-write the default endianness for that call.

### `new Bufo(buffer, defaultEncoding)`
Create a new Bufo instance, wrapping the given input. How the input is handled depends on the type, check the table below.

| Type | Action |
| ---- | ------ |
| `Buffer` | Buffer will be wrapped by the Bufo instance. |
| `Bufo` | Wrapped buffer will be wrapped by this instance, too. |
| `Array` | Treated as a byte-array, new buffer will be allocated, wrapped and filled with the bytes. |
| `string` | Will be treated as a byte-array, with each char being a single byte. See Array.
| `number` | An empty instance allocated to the given size. |
| `DataView` | The given DataView will be wrapped by the Bufo instance. |
| `ArrayBuffer` | A DataView for this ArrayBuffer will be created and wrapped by the Bufo instance. |

Parameter | Type | Info
--------- | ---- | ----
buffer | `*` | Input, see table above.
defaultEncoding *(optional)* | `number` | Default endianness to use for all integer operations.

### `byteLength` : `number`
The capacity of the internal buffer.

### `remainingBytes` : `number`
The amount of bytes between the current offset and the buffer end. (`byteLength - offset`).

### `offset` : `number`
The current offset for reading/writing operations.

### `lastWriteOffset` : `number`
The offset of the buffer after the last write operation occurred. When writing data in a linear fashion, this can be used to indicate the buffer data length with `byteLength` as the overall capacity.

### `raw` : `Buffer`
The internal buffer reference.

### `setEndian(endian)`
Set the default endianness to use for integer operations. This can be overwritten on a per-call basis for Int16/Int32 operations.

Parameter | Type | Info
--------- | ---- | ----
endian | `number` | `Bufo.ENDIAN_LITTLE` or `Bufo.ENDIAN_BIG`

### `seek(offset)`
Set the absolute offset of this instance. If a negative value is provided, the offset will be set to that many bytes from the end of the buffer.

Parameter | Type | Info
--------- | ---- | ----
offset | `number` | Absolute offset to set.

### `move(offset)`
Set the offset relative to the current offset. Positive values will move the offset forward, negative values will move it backward. This does not wrap-around and will throw an error if you shift out of bounds.

Parameter | Type | Info
--------- | ---- | ----
offset | `number` | Amount to shift the offset by.

### `readInt8(count)`
Read one or more signed 8-bit integers from the buffer. If `count` is greater than one, an `Array` will be returned, otherwise the result will be a single `number` value.

Parameter | Type | Info
--------- | ---- | ----
count *(optional)* | `number` | How many integers to read. Defaults to 1.

### `readUInt8(count)`
Read one or more unsigned 8-bit integers from the buffer. If `count` is greater than one, an `Array` will be returned, otherwise the result will be a single `number` value.

Parameter | Type | Info
--------- | ---- | ----
count *(optional)* | `number` | How many integers to read. Defaults to 1.

### `readInt16(count, endian)`
Read one or more signed 16-bit integers from the buffer. If `count` is greater than one, an `Array` will be returned, otherwise the result will be a single `number` value.

Parameter | Type | Info
--------- | ---- | ----
count *(optional)* | `number` | How many integers to read. Defaults to 1.
endian *(optional)* | `number` | Override the default endian for this call.

### `readIntU16(count, endian)`
Read one or more unsigned 16-bit integers from the buffer. If `count` is greater than one, an `Array` will be returned, otherwise the result will be a single `number` value.

Parameter | Type | Info
--------- | ---- | ----
count *(optional)* | `number` | How many integers to read. Defaults to 1.
endian *(optional)* | `number` | Override the default endian for this call.

### `readInt32(count, endian)`
Read one or more signed 32-bit integers from the buffer. If `count` is greater than one, an `Array` will be returned, otherwise the result will be a single `number` value.

Parameter | Type | Info
--------- | ---- | ----
count *(optional)* | `number` | How many integers to read. Defaults to 1.
endian *(optional)* | `number` | Override the default endian for this call.

### `readIntU32(count, endian)`
Read one or more unsigned 32-bit integers from the buffer. If `count` is greater than one, an `Array` will be returned, otherwise the result will be a single `number` value.

Parameter | Type | Info
--------- | ---- | ----
count *(optional)* | `number` | How many integers to read. Defaults to 1.
endian *(optional)* | `number` | Override the default endian for this call.

### `readString(length)`
Read a string from the buffer. If `length` is omitted, a single `UInt32` will be read first and used as the length.

Parameter | Type | Info
--------- | ---- | ----
length *(optional)* | `number` | Length of the string to read.

### `readUTF8String(length)`
Read a UTF8 encoded string from the buffer. If `length` is omitted, a single `UInt32` will be read first and used as the length.

Parameter | Type | Info
--------- | ---- | ----
length *(optional)* | `number` | Length of the string to read.

### `readBuffer(length)`
Reads `length` bytes from the buffer, writes them to a newly allocated buffer, and returns it. If `length` is omitted, `remainingBytes` will be used.

Parameter | Type | Info
--------- | ---- | ----
length *(optional)* | `number` | How many bytes to read.

### `readBufo(length)`
Reads and returns a buffer, wrapped in a new Bufo instance. Check `readBuffer` documentation for details.

### `writeInt8(input)`
Write one or more signed 8-bit integers to the buffer.

Parameter | Type | Info
--------- | ---- | ----
input | `number\|Array` | Values to be written.

### `writeUInt8(input)`
Write one or more unsigned 8-bit integers to the buffer.

Parameter | Type | Info
--------- | ---- | ----
input | `number\|Array` | Values to be written.

### `writeInt16(input, endian)`
Write one or more signed 16-bit integers to the buffer.

Parameter | Type | Info
--------- | ---- | ----
input | `number\|Array` | Values to be written.
endian *(optional)* | `number` | Override the default endian for this call.

### `writeUInt16(input, endian)`
Write one or more unsigned 16-bit integers to the buffer.

Parameter | Type | Info
--------- | ---- | ----
input | `number\|Array` | Values to be written.
endian *(optional)* | `number` | Override the default endian for this call.

### `writeInt32(input, endian)`
Write one or more signed 32-bit integers to the buffer.

Parameter | Type | Info
--------- | ---- | ----
input | `number\|Array` | Values to be written.
endian *(optional)* | `number` | Override the default endian for this call.

### `writeUInt32(input, endian)`
Write one or more unsigned 32-bit integers to the buffer.

Parameter | Type | Info
--------- | ---- | ----
input | `number\|Array` | Values to be written.
endian *(optional)* | `number` | Override the default endian for this call.

### `writeString(str, prefix)`
Write a string to the buffer with each character as a seperate byte. If `prefix` is true, the byte-length will be written as a `UInt32` first.

Parameter | Type | Info
--------- | ---- | ----
str | `string` | String to write to the buffer.
prefix | `boolean` | If set, length-prefixes the string.

### `writeUTF8String(str, prefix)`
Writes a UTF8 string to the buffer. If `prefix` is true, the byte-length will be written as a `UInt32` first.

Parameter | Type | Info
--------- | ---- | ----
str | `string` | String to write to the buffer.
prefix | `boolean` | If set, length-prefixes the string.

### `writeBuffer(buffer, offset, count)`
Writes a buffer (or Bufo instance) to the buffer. If `offset` is omitted, it will default to `0` for buffers and `bufo.offset` for a Bufo instance. If `count` is omitted, it will default to `buffer.length` for buffers and `bufo.remainingBytes` for a Bufo instance.

Parameter | Type | Info
--------- | ---- | ----
buffer | `Buffer\|Bufo` | Buffer to read from.
offset *(optional)* | `number` | Offset to start reading from.
count *(optional)* | `number` | How many bytes to read.

### `toFile(path, count, options)`
Write the specified count of bytes to a file.

Parameter | Type | Info
--------- | ---- | ----
path | `string` | File path.
count *(optional)* | `number` | Amount of bytes to write. Defaults to `remainingBytes`.
options *(optional)* | `object` | Options table. See `fs.createWriteStream` for usage.