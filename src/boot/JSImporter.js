"use strict"

/*
	A simple javascript importing system.
	This runs _import.js which will then reference js and css files and
	_import.js file in it's subfolders.
	This makes source reorganizations easier and helps
	keep folder organization aligned with dependency organization
	
	Add an _imports.js file - here's an example. Notice you can reference css files as well.
	
	JSImporter.pushRelativePaths([
		"_css.css",
		"external_libs/_imports.js",
		"data/_imports.js",
		"src/_imports.js",
		"MyApp.js",
	])
	
	The paths in each _imports.js file are relative to the folder it is found within.

	If you need to call some initialization functions after everything is loaded, 
	you can call JSImporter.pushDoneCallback() in the related folder's _imports.js

		JSImporter.pushDoneCallback( () => {
			sjcl.random.startCollectors();
		})		
*/

var ObjectCloneFunction = function() {
	var constructor = new Function;
	constructor.prototype = this;
	var instance = new constructor;
	if (instance.init) {
		instance.init()
	}
	return instance
}

var CSSLink = {
	_fullPath: null,
	clone: ObjectCloneFunction,
	
	setFullPath: function(aPath) {
		this._fullPath = aPath
		return this
	},
	
	run : function() {
		var styles = document.createElement('link');
		styles.rel = 'stylesheet';
		styles.type = 'text/css';
		styles.media = 'screen';
		styles.href = this._fullPath;
		document.getElementsByTagName('head')[0].appendChild(styles);
	},	
}

var JSScript = {
	_importer: null,
	_fullPath: null,
	_doneCallback: null,

	clone: ObjectCloneFunction,
	
	setImporter: function(obj) {
		this._importer = obj
		return this
	},
	
	fullPath: function() {
		return this._fullPath
	},
	
	setDoneCallback: function(callback) {
		this._doneCallback = callback
		return this
	},
	
	setFullPath: function(aPath) {
		this._fullPath = aPath
		return this
	},
	
	run: function() {
	    var script = document.createElement('script');
	    script.src = this._fullPath;
		console.log("JSScript " + this._fullPath)

	    script.onload = () => {
			this._doneCallback()
	    }

	    script.onerror = (error) => {
			this._importer.setError(error)
			throw new Error("missing url " + this._fullPath)
	    }

	    var parent = document.getElementsByTagName('head')[0] || document.body;
	    parent.appendChild(script)			
	},
	
	basePath: function() {
		var parts = this.fullPath().split("/")
		parts.pop()
		var basePath = parts.join("/")
		return basePath
	},
},

JSImporter = {
	_currentScript: null,
	_urls: [],
	_doneCallbacks: [],
	_urlLoadingCallbacks: [],
	_errorCallbacks: [],

	clone: ObjectCloneFunction,


	currentScriptPath: function() {
		if (this._currentScript) {
			return this._currentScript.basePath()
		}
		return ""
	},
	
	absolutePathForRelativePath: function(aPath) {
		var parts = this.currentScriptPath().split("/").concat(aPath.split("/")) 
		var rPath = parts.join("/")
		
		/*
		if (rPath[0] == "/"[0]) {
			rPath = "." + rPath
		}
		*/

		if (rPath[0] == "/"[0]) {
			rPath = rPath.substr(1)
		}
				
		
		return rPath
	},	
		
	absolutePathsForRelativePaths: function(paths) {
		return paths.map((aPath) => { return this.absolutePathForRelativePath(aPath) })
	},

	pushRelativePaths: function(paths) {
		this.pushFilePaths(this.absolutePathsForRelativePaths(paths))
		return this
	},
		
	pushFilePaths: function(paths) {
		this._urls = paths.concat(this._urls)
		return this
	},

	urls: function() {
		return this._urls
	},

	pushDoneCallback: function(aCallback) {
		this._doneCallbacks.push(aCallback)
		return this
	},
	
	pushUrlLoadingCallback: function(aCallback) {
		this._urlLoadingCallbacks.push(aCallback)
		return this
	},
	
	pushErrorCallback: function(aCallback) {
		this._errorCallbacks.push(aCallback)
		return this
	},
	
	removeErrorCallback: function(aCallback) {
		this._errorCallbacks.remove(aCallback)
		return this
	},
	
	removeUrlCallback: function(aCallback) {
		this._urlLoadingCallbacks.remove(aCallback)
		return this
	},
	

	run: function() {
	    this.loadNext();
	},

	isDone: function() {
		return this.urls().length == 0	
	},
	
	loadNext: function() {
		if (!this.isDone()) {
	        var url = this._urls.shift();			
			this.loadUrl(url)
		} else {
			this.done()
		}
		return this
	},

	loadUrl: function(url) {
		this._urlLoadingCallbacks.forEach((callback) => { callback(url) })

		var extension = url.split('.').pop();
		
		if (extension == "js" || extension == "json") {
			this._currentScript = JSScript.clone().setImporter(this).setFullPath(url).setDoneCallback(() => { this.loadNext() })
			//console.log("this._currentScript = ", this._currentScript)
			this._currentScript.run()
		} else if (extension == "css") {
			CSSLink.clone().setFullPath(url).run()
			this.loadNext()
		} else {
			throw new Error("unrecognized extension on url '" + url + "'")
		}
		
		return this	
	},

	done: function() {
		this._doneCallbacks.forEach((callback) => { callback() })
		return this
	},

	setError: function(error) {
		this._errorCallbacks.forEach((callback) => { callback(error) })
		return this		
	},
}

JSImporter.pushRelativePaths(["_imports.js"]).run()
