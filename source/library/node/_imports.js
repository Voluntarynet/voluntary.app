"use strict"

ResourceLoader.pushRelativePaths([
    "styles/_imports.js",
    "BMNode.js",
	
    "storage/_imports.js",
    "nodes/_imports.js",
    "fields/_imports.js",
    "storage/BMDataStoreRecord.js", // because this is a subclass of BMFieldSetNode
    
    "node_views/_imports.js",

    "App.js"
])
