//
// Achive.js
// 
// This script builds a index.html file for the app
// containing all the css and js file content.
//
// The resulting index.html (with the font and icon folders) 
// should be able to run the app on it's own.
//

// --- some helpful ultility methods ----

Array.prototype.removeFirst = function () {
    return this.shift();
}

Array.prototype.appendItems = function (elements) {
    this.push.apply(this, elements);
    return this;
}

String.prototype.contains = function (aString) {
    return this.indexOf(aString) > -1;
}

String.prototype.before = function (aString) {
    var index = this.indexOf(aString);
    
    if (index === -1) {
        return this;
    }

    return this.slice(0, index);
}

String.prototype.after = function (aString) {
    var index = this.indexOf(aString);

    if (index === -1) {
        return "";
    }
    
    return this.slice(index + aString.length);
}

String.prototype.between = function (prefix, suffix) {
    var after = this.after(prefix);
    if (after != null) {
        var before = after.before(suffix);
        if (before != null) {
            return before;
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}

// --- node.js imports -------------------------------------------------------------------

var path = require("path");
var fs = require("fs")

// --- Archive ---

class Archive { 
    constructor() {
        this._filePaths = []
        this._importPaths = []
        this._cssPaths = []
    }

    filePaths() {
        return this._filePaths
    }

    importPaths() {
        return this._importPaths
    }

    cssPaths() {
        return this._cssPaths
    }

    open() {
        this.addImportPath("../_imports.js")
        //this.readImports()
        this.createIndex()
    }

    addFilePath(aFullPath) {
        this.filePaths().push(aFullPath)
    }

    addImportPath(aPath) {
        this.addFilePath(aPath)
        var folder = new SourceFolder()
        folder.setFullPath(aPath)
        folder.open()

        //this.importPaths().push(aPath)
    }

    addCssPath(aPath) {
        this.cssPaths().push(aPath)
    }

    createIndex() {
        console.log(this.filePaths().join("\n"))
        var indexPaths = []
        indexPaths.push("top.html")
        indexPaths.appendItems(this.cssPaths())
        indexPaths.push("middle.html")
        indexPaths.push("../src/boot/LoadProgressBar.js")
        indexPaths.push("../src/boot/JSImporter.js")
        indexPaths.appendItems(this.filePaths())
        indexPaths.push("bottom.html")

        var index = indexPaths.map((path) => {
            return fs.readFileSync(path,  "utf8")
        }).join("\n")

        //console.log(index)
        fs.writeFileSync("../index.html", index, "utf8")
    }
}

// --- SourceFolder ---

class SourceFolder { 
    constructor() {
        this._fullPath = null
        this._importPaths = []
        this._filePaths = []
        this._cssPaths = []
    }

    setFullPath(aString) {
        this._fullPath = aString
    }

    fullPath() {
        return this._fullPath
    }

    importPaths() {
        return this._importPaths
    }

    filePaths() {
        return this._filePaths
    }

    cssPaths() {
        return this._cssPaths
    }

    open() {
        var dirPath = this.fullPath().before("_imports.js")
        var data = fs.readFileSync(this.fullPath(),  "utf8");
        var s = data.between("JSImporter.pushRelativePaths(", ")")
        var rPaths = eval(s)

        rPaths.forEach((relativePath) => {
            var fullPath = path.join(dirPath, relativePath)

            if (fullPath.contains("_imports.js")) {
                archive.addImportPath(fullPath)
            } else if (fullPath.contains(".css")) {
                archive.addCssPath(fullPath)
            } else {
                archive.addFilePath(fullPath)
            }
        })
    }
}

var archive = new Archive()
archive.open()

