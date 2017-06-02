
JSImporter.pushRelativePaths([
    "bloom-filter.js",
]).pushDoneCallback(() => {
	
	BloomFilter = require('bloom-filter');
	
	BloomFilter.prototype.serialized = function() {
		// toObject format example: {"vData":[42,198],"nHashFuncs":5,"nTweak":0,"nFlags":0}
		var obj = this.toObject()
		console.log("obj.nHashFuncs = ", obj.nHashFuncs)
		console.log("obj.vData.length = ", obj.vData.length)
		var array = obj.vData.concat([obj.nHashFuncs, obj.nTweak, obj.nFlags])
		return array.join("_")
	}
	
	BloomFilter.prototype.unserialized = function(aString) {		
		var array = aString.split("_")
		var obj = {}
		obj.nFlags = array.pop()
		obj.nTweak = array.pop()
		obj.nHashFuncs = array.pop()
		obj.vData = array
		var filter = new BloomFilter(obj);
		return filter
	}
	
})
