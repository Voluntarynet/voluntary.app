"use strict"

/*

    FilePath

    Abstraction of file system or URL path.
*/


window.ideal.FilePath = class FilePath extends ProtoClass {

    init () {
        this.newSlot("pathString", null)
    }

    static with(pathString) {
        return FilePath.clone().setPathString(pathString)
    }
 
    static pathSeparator() {
        return "/"
    }

    pathComponents () {
        const s = this.pathString()

        if (s === "/") {
            return [""];
        }
        else if (s === "") {
            return [];
        }
        
        return s.split("/");
    }

    sansLastPathComponent () {
        const c = this.pathComponents()
        c.removeLast();
        return c.join("/");
    }

    lastPathComponent () {
        return this.pathComponents().last();
    }

    pathExtension() {
        const extension = this.pathString().split(".").last();
        return extension;
    }

}.initThisClass()

