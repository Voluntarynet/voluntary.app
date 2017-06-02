
JSImporter.pushRelativePaths([
    "bloom.js",
]).pushDoneCallback(() => {
	JSBloom.newFilter = function(a, b) {
		var filter = JSBloom.filter(a, b)
		
		filter.asUncompactedBitArray = function() {
			throw new Error("unimplemented")
		}
		
		filter.asUncompactedUint8BitArray = function() {
			return this.info.raw_buffer
		}
		
		/*	
		filter.serialized = function() {
			var s = this.exportData();
			// end with alphanumeric to make peerjs id validation happy
			s = s.replaceAll("+", "_0")
			s = s.replaceAll("/", "_1")
			s = s.replaceAll("=", "_2")
			return "0" + s // pad front to ensure that first character is alphanumeric
		}

		filter.unserialized = function(s) {
			s = s.substr(1);
			s = s.replaceAll("_0", "+")
			s = s.replaceAll("_1", "/")
			s = s.replaceAll("_2", "=")
			this.importData(s)
			return this
		}
		*/
		
		return filter
	}
})
