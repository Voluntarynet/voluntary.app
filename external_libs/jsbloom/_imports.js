
ResourceLoader.pushRelativePaths([
    "bloom.js",
]).pushDoneCallback(() => {
    JSBloom.newFilter = function (a, b) {
        const filter = JSBloom.filter(a, b)

        filter.asUncompactedUint8BitArray = function () {
            return this.info.raw_buffer
        }

        //if (true) {

        filter.serialized = function () {
            var s = this.exportData();
            // end with alphanumeric to make peerjs id validation happy
            s = s.replaceAll("+", "_0")
            s = s.replaceAll("/", "_1")
            s = s.replaceAll("=", "_2")
            //encodeURIComponent(s)
            return "0" + s // pad front to ensure that first character is alphanumeric
        }

        filter.unserialized = function (s) {
            s = s.substr(1); // remove front padding character
            s = s.replaceAll("_0", "+")
            s = s.replaceAll("_1", "/")
            s = s.replaceAll("_2", "=")
            this.importData(s)
            return this
        }

        /*
		} else {
			// peerjs doesn't like the % escape character, should we fix this?
			
			filter.serialized = function() {
				return encodeURIComponent(s) // pad front to ensure that first character is alphanumeric
			}

			filter.unserialized = function(s) {
				s = decodeURIComponent(s)
				this.importData(s)
				return this
			}
		}
		*/

        return filter
    }
});
