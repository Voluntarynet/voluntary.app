var fs = require('fs');
var path = require('path')

Folder = ideal.Proto.extend().newSlots({
    type: "Folder",
    path: null,
}).setSlots({
    init: function () {
    },
    
    name: function () {
        return path.parse(this.path()).base
    },
    
    exists: function () {
        var p = this.path()
	    return fs.existsSync(p) && fs.statSync(p).isDirectory() // redundant?
    },
    
    createIfAbsent: function() {
        if (!this.exists()) {
            fs.mkdirSync(this.path());
        }
        return this
    },
    
    childNames: function () {
        return fs.readdirSync(this.path())        
    },
    
	children: function() {
	    return this.childPaths().map(function (p) {
	        if (fs.statSync(p).isDirectory()) {
	            return Folder.clone().setPath(p)
	        } else {
	            return File.clone().setPath(p)
	        }
        })
	},
    
    childPaths: function () {
        var base = this.path()
        return this.childNames().map(function (p) { return path.join(base, p) })
    },

    files: function () {
        var files = []
	    this.childPaths().forEach(function (p) {
	        if (!fs.statSync(p).isDirectory()) {
	            files.push(File.clone().setPath(p))
	        }
        })
        return files
    },
    
    folders: function () {
        var folders = []
	    this.childPaths().forEach(function (name) {
	        if (fs.statSync(p).isDirectory()) {
	            folders.push(Folder.clone().setPath(p))
	        }
        })
        return folders
    },
    
    folderNamed: function(aName) {
        var p = path.join(this.path(), aName)
        return Folder.clone().setPath(p)
    },
    
    fileNamed: function(aName) {
        if (this.path() == null || aName == null) {
            console.error("fileNamed ", this.path(), aName)
        }
        var p = path.join(this.path(), aName)
        return File.clone().setPath(p)
    },
    
    hasFiles: function() {
        return this.childNames().length > 0
    },
    
    rename: function(aName) { 
        // just change name but keep paretn folder
        // TODO: handler errors
        var parentPath = path.parse(this.path()).dir
        var newPath = path.join(parentPath, name)
        fs.renameSync(this.path(), newPath)    
        this.setPath(newPath)
        return this
    },
    
    moveFilesToFolder: function(aFolder) {
        this.files().forEach(function (file) {
            file.moveToFolder(aFolder)
        })
        return this
    },
    
    removeFiles: function() {
        this.files().forEach(function (file) {
            file.delete()
        })
        return this
    },
    
})
