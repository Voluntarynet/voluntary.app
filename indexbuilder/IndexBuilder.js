/*
   Achive.js
   
   This script builds a index.html file for the app
   containing all the css and js file content.
  
   The resulting index.html (with the font and icon folders) 
   should be able to run the app on it's own.
   
*/

// --- some helpful ultility methods ----

Object.defineSlots = function(obj, dict) {
    Object.keys(dict).forEach((slotName) => {
        const slotValue = dict[slotName]
        const descriptor = {
            configurable: true,
            enumerable: false,
            value: slotValue,
            writable: true,
        }
        Object.defineProperty(obj, slotName, descriptor)
    })
}

Object.defineSlots(Array.prototype, {
    removeFirst: function () {
        return this.shift();
    },

    appendItems: function (elements) {
        this.push.apply(this, elements);
        return this;
    },
})

Object.defineSlots(String.prototype, {

    contains: function (aString) {
        return this.indexOf(aString) !== -1;
    },

    before: function (aString) {
        const index = this.indexOf(aString);
        
        if (index === -1) {
            return this;
        }

        return this.slice(0, index);
    },

    after: function (aString) {
        const index = this.indexOf(aString);

        if (index === -1) {
            return "";
        }
        
        return this.slice(index + aString.length);
    },

    between: function (prefix, suffix) {
        const after = this.after(prefix);
        if (after !== null) {
            const before = after.before(suffix);
            if (before !== null) {
                return before;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    },


    replaceAll: function (target, replacement) {
        return this.split(target).join(replacement);
    },

})

// --- node.js imports -------------------------------------------------------------------

const path = require("path");
const fs = require("fs")

// --- IndexBuilder ---

class IndexBuilder { 
    constructor() {
        this._filePaths = []
        this._importPaths = []
        this._cssPaths = []
        this._resourceFilePaths = []
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

    addResourceFilePath(aPath) {
        // since indexbuilder isn't on top level, but index.html will be,
        // we need to fix the path
        aPath = aPath.replaceAll("../", "./") 
        this._resourceFilePaths.push(aPath)
    }

    stringForPaths(filePaths) {
        return filePaths.map(path => fs.readFileSync(path,  "utf8")).join("\n")
    }

    allScriptPaths() {
        const scriptPaths =  []
        scriptPaths.push("../source/boot/ResourceLoaderPanel.js")
        scriptPaths.push("../source/boot/ResourceLoader.js")
        scriptPaths.appendItems(this.filePaths())
        return scriptPaths
    }

    createIndex() {
        console.log("IndexBuilder: inserting imports between templates to create index.html")
        console.log(this.filePaths().join("\n"))

        const css      = this.stringForPaths(this.cssPaths())
        const script   = this.stringForPaths(this.allScriptPaths()) + "\nResourceLoader.setResourceFilePaths(" + JSON.stringify(this._resourceFilePaths) + ");\n"
        let index = this.stringForPaths(["template.html"])
        index = index.replaceAll("/* INSERT CSS HERE */", css)
        index = index.replaceAll("/* INSERT SCRIPT HERE */", script)

        //console.log(index)
        fs.writeFileSync("../index.html", index, "utf8")
        console.log("IndexBuilder: SUCCESS: created index.html")
    }

    createIndex_OLD() {
        console.log("IndexBuilder: inserting imports between templates to create index.html")
        console.log(this.filePaths().join("\n"))

        const indexPaths = []
        indexPaths.push("templates/top.html")
        indexPaths.appendItems(this.cssPaths())
        indexPaths.push("templates/middle.html")
        indexPaths.push("../source/boot/ResourceLoaderPanel.js")
        indexPaths.push("../source/boot/ResourceLoader.js")
        indexPaths.appendItems(this.filePaths())
        indexPaths.push("templates/bottom.html")

        console.log("indexPaths: ", indexPaths.join("\n"))
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
        const s = data.between("ResourceLoader.pushRelativePaths(", ")")
        const rPaths = eval(s)
        const builder = this.indexBuilder()

        rPaths.forEach((relativePath) => {
            const fullPath = path.join(dirPath, relativePath)

            if (fullPath.contains("_imports.js")) {
                builder.addImportPath(fullPath)
            } else if (fullPath.contains(".css")) {
                builder.addCssPath(fullPath)
            } else if (fullPath.contains(".js")) {
                builder.addFilePath(fullPath)
            } else {
                builder.addResourceFilePath(fullPath)
            }
        })
    }
}

new IndexBuilder().run() 

