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
    return this.indexOf(aString) !== -1;
}

String.prototype.before = function (aString) {
    const index = this.indexOf(aString);
    
    if (index === -1) {
        return this;
    }

    return this.slice(0, index);
}

String.prototype.after = function (aString) {
    const index = this.indexOf(aString);

    if (index === -1) {
        return "";
    }
    
    return this.slice(index + aString.length);
}

String.prototype.between = function (prefix, suffix) {
    const after = this.after(prefix);
    if (after != null) {
        const before = after.before(suffix);
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

const path = require("path");
const fs = require("fs")

// --- IndexBuilder ---

class IndexBuilder { 
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

    run() {
        console.log("IndexBuilder: finding imports")
        this.addImportPath("../_imports.js")
        //this.readImports()
        this.createIndex()
    }

    addFilePath(aFullPath) {
        this.filePaths().push(aFullPath)
    }

    addImportPath(aPath) {
        this.addFilePath(aPath)
        const folder = new SourceFolder()
        folder.setFullPath(aPath)
        folder.setIndexBuilder(this)
        folder.open()

        //this.importPaths().push(aPath)
    }

    addCssPath(aPath) {
        this.cssPaths().push(aPath)
    }

    createIndex() {
        console.log("IndexBuilder: inserting imports between templates to create index.html")
        console.log(this.filePaths().join("\n"))

        const indexPaths = []
        indexPaths.push("templates/top.html")
        indexPaths.appendItems(this.cssPaths())
        indexPaths.push("templates/middle.html")
        indexPaths.push("../src/boot/JSImporterPanel.js")
        indexPaths.push("../src/boot/JSImporter.js")
        indexPaths.appendItems(this.filePaths())
        indexPaths.push("templates/bottom.html")

        const index = indexPaths.map((path) => {
            return fs.readFileSync(path,  "utf8")
        }).join("\n")

        //console.log(index)
        fs.writeFileSync("../index.html", index, "utf8")
        console.log("IndexBuilder: SUCCESS: created index.html")
    }
}

// --- SourceFolder ---

class SourceFolder { 
    constructor() {
        this._fullPath = null
        /*
        this._importPaths = []
        this._filePaths = []
        this._cssPaths = []
        */
        this._indexBuilder = null
    }

    setFullPath(aString) {
        this._fullPath = aString
        return this
    }

    fullPath() {
        return this._fullPath
    }

    /*
    importPaths() {
        return this._importPaths
    }

    filePaths() {
        return this._filePaths
    }

    cssPaths() {
        return this._cssPaths
    }
    */

    setIndexBuilder(v) {
        this._indexBuilder = v
        return this
    }

    indexBuilder() {
        return this._indexBuilder
    }

    open() {
        const dirPath = this.fullPath().before("_imports.js")
        const data = fs.readFileSync(this.fullPath(),  "utf8");
        const s = data.between("JSImporter.pushRelativePaths(", ")")
        const rPaths = eval(s)
        const builder = this.indexBuilder()

        rPaths.forEach((relativePath) => {
            const fullPath = path.join(dirPath, relativePath)

            if (fullPath.contains("_imports.js")) {
                builder.addImportPath(fullPath)
            } else if (fullPath.contains(".css")) {
                builder.addCssPath(fullPath)
            } else {
                builder.addFilePath(fullPath)
            }
        })
    }
}

new IndexBuilder().run() 

