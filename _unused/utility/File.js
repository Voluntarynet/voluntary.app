var fs = require('fs');
var path = require('path');

File = ideal.Proto.extend().newSlots({
    type: "File",
    path: null,
}).setSlots({
    init: function () {
    },
    
    name: function () {
        return path.parse(this.path()).base
    },
    
    folderPath: function () {
        return path.parse(this.path()).dir
    },
    
    folder: function () {
        return Folder.clone().setPath(this.folderPath())
    },
    
    exists: function () {
        return fs.existsSync(this.path())
    },
    
    delete: function() {
        fs.unlinkSync(this.path());
        return this
    },
    
    contents: function () {
        this.assertExists()
        var contents = fs.readFileSync(this.path(), 'utf8');
        return contents
    },

    setContents: function (data) {
        fs.writeFileSync(this.path(), data);
        return this
    },
    
    assertExists: function () {
        if (!this.exists()) {
            throw "file '" + this.name() + "' missing"
        }
    },

    jsonContents: function () {
        //this.assertExists()
        return JSON.parse(this.contents())
    },
    
    setJsonContents: function (jsonDict) {
        var jsonString = JSON.stringify(jsonDict, null, '\t')
        this.setContents(jsonString)
        return this
    },
   
    appendString: function(aString) {
        var fd = fs.openSync(this.path(), 'a')
        fs.writeSync(fd, aString)
        fs.closeSync(fd)
        return this
    },
    
    moveToFolder: function(aFolder) {
        var newPath = path.join(aFolder().path(), this.name())
        fs.renameSync(this.path(), newPath) 
        this.setPath(newPath)           
        return this
    },
})
