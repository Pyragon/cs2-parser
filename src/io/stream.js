class Stream {

    constructor(size = 16) {
        this.array = new Int8Array(size);
        this.offset = 0;
    }

    writeByte(value) {
        let position = this.offset++;
        this.checkCapacity(position);
        this.array[position] = value;
    }

    writeBytes(value) {
        this.checkCapacity(this.offset + value.length);
        this.array.set(value, this.offset);
        this.offset += value.length;
    }

    writeShort(value) {
        this.writeByte(value >> 8);
        this.writeByte(value);
    }

    writeInt(value) {
        this.writeByte(value >> 24);
        this.writeByte(value >> 16);
        this.writeByte(value >> 8);
        this.writeByte(value);
    }

    writeLong(value) {
        writeByte(value >> 56);
        writeByte(value >> 48);
        writeByte(value >> 40);
        writeByte(value >> 32);
        writeByte(value >> 24);
        writeByte(value >> 16);
        writeByte(value >> 8);
        writeByte(value);
    }

    writeString(value) {
        // let first = value.indexOf(0);
        // if (first >= 0) throw new Error('');
        this.checkCapacity(this.offset + value.length + 1);
        this.offset += this.writeStringUtil(value, 0, value.length);
        this.array[this.offset++] = 0;
    }

    writeStringUtil(value, start, end) {
        let length = end - start;

        for (let i = 0; i < length; i++) {
            let c = value.charCodeAt(i);
            if (c > 0 && c < 128 || c >= 160 && c <= 255)
                this.array[i + this.offset] = c;
            else if (c == 8364)
                this.array[i + this.offset] = -128;
            else if (c == 8218)
                this.array[i + this.offset] = -126;
            else if (c == 402)
                this.array[i + this.offset] = -125;
            else if (c == 8222)
                this.array[i + this.offset] = -124;
            else if (c == 8230)
                this.array[i + this.offset] = -123;
            else if (c == 8224)
                this.array[i + this.offset] = -122;
            else if (c == 8225)
                this.array[i + this.offset] = -121;
            else if (c == 710)
                this.array[i + this.offset] = -120;
            else if (c == 8240)
                this.array[i + this.offset] = -119;
            else if (c == 352)
                this.array[i + this.offset] = -118;
            else if (c == 8249)
                this.array[i + this.offset] = -117;
            else if (c == 338)
                this.array[i + this.offset] = -116;
            else if (c == 381)
                this.array[i + this.offset] = -114;
            else if (c == 8216)
                this.array[i + this.offset] = -111;
            else if (c == 8217)
                this.array[i + this.offset] = -110;
            else if (c == 8220)
                this.array[i + this.offset] = -109;
            else if (c == 8221)
                this.array[i + this.offset] = -108;
            else if (c == 8226)
                this.array[i + this.offset] = -107;
            else if (c == 8211)
                this.array[i + this.offset] = -106;
            else if (c == 8212)
                this.array[i + this.offset] = -105;
            else if (c == 732)
                this.array[i + this.offset] = -104;
            else if (c == 8482)
                this.array[i + this.offset] = -103;
            else if (c == 353)
                this.array[i + this.offset] = -102;
            else if (c == 8250)
                this.array[i + this.offset] = -101;
            else if (c == 339)
                this.array[i + this.offset] = -100;
            else if (c == 382)
                this.array[i + this.offset] = -98;
            else if (c == 376)
                this.array[i + this.offset] = -97;
            else
                this.array[i + this.offset] = 63;
        }
        return length;
    }

    checkCapacity(position) {
        if (position >= this.array.length) {
            let newArr = new Int8Array(position + 16);
            newArr.set(this.array);
            this.array = newArr;
        }
    }

    toArray() {
        let newArr = new Int8Array(this.offset);
        for (let i = 0; i < this.offset; i++)
            newArr[i] = this.array[i];
        return newArr;
    }

}

module.exports = Stream;