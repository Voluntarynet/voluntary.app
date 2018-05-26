"use strict"

// --- string ----

Object.shallowCopyTo({
    isEmpty: function () {
        return this.length == 0;
    },

    beginsWith: function (prefix) {
        if (!prefix) return false;
        return this.indexOf(prefix) == 0;
    },

    endsWith: function (suffix) {
        var index = this.lastIndexOf(suffix);
        return (index > -1) && (this.lastIndexOf(suffix) == this.length - suffix.length);
    },

    contains: function (aString) {
        return this.indexOf(aString) > -1;
    },

    before: function (aString) {
        var index = this.indexOf(aString);
        if (index == -1) {
            return null;
        }
        else {
            return this.slice(0, index);
        }
    },

    after: function (aString) {
        var index = this.indexOf(aString);
        if (index == -1) {
            return null;
        }
        else {
            return this.slice(index + aString.length);
        }
    },

    between: function (prefix, suffix) {
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
    },

    at: function (i) {
        return this.slice(i, i + 1);
    },

    first: function () {
        return this.slice(0, 1);
    },

    rest: function () {
        return this.slice(1);
    },

    repeated: function (times) {
        var result = "";
        var aString = this;
        times.repeat(function () { result += aString });
        return result
    },

    prefixRemoved: function (prefix) {
        return this.substring(this.beginsWith(prefix) ? prefix.length : 0);
    },

    suffixRemoved: function (suffix) {
        if (this.endsWith(suffix)) {
            return this.substr(0, this.length - suffix.length);
        }
        else {
            return this;
        }
    },

    stripped: function () {
        return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },

    uncapitalized: function () {
        return this.replace(/\b[A-Z]/g, function (match) {
            return match.toLowerCase();
        });
    },

    asNumber: function () {
        return Number(this);
    },

    //move to libraries?
    humanized: function () //someMethodName -> Some Method Name
    {
        var words = [];
        var start = -1;
        var capitalized = this.capitalized();
        for (var i = 0; i < capitalized.length; i++) {
            if (capitalized.slice(i, i + 1).match(/[A-Z]/)) {
                var word = capitalized.slice(start, i);
                if (word) {
                    words.append(word);
                }
                start = i;
            }
        }
        words.append(capitalized.slice(start, i));
        return words.join(" ");
    },

    titleized: function () {
        return this.split(/\s+/).map(function (s) { return s.capitalized() }).join(" ");
    },

    base64Encoded: function () {
        //btoa(this);
        return new Buffer(String(this), "utf8").toString("base64");
    },

    base64UrlEncoded: function () {
        return this.base64Encoded().replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ',');
    },

    base64Decoded: function () {
        return new Buffer(String(this), "base64").toString("utf8");
        //return atob(this);
    },

    base64UrlDecoded: function () {
        return this.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '=').base64Decoded();
    },

    stringCount: function (str) {
        return this.split(str).length - 1;
    },

    lineCount: function () {
        return this.stringCount("\n");
    },

    pathComponents: function () {
        if (this == "/") {
            return [""];
        }
        else if (this == "") {
            return [];
        }
        else {
            return this.split("/");
        }
    },

    sansLastPathComponent: function () {
        var c = this.pathComponents()
        c.removeLast();
        return c.join("/");
    },

    lastPathComponent: function () {
        return this.pathComponents().last();
    },

    fileNameSuffix: function () {
        var suffix = this.split(".").last();
        return suffix;
    },

    padLeft: function (length, padding) {
        var str = this;
        while (str.length < length) {
            str = padString + str;
        }

        return str.substring(0, length);
    },

    padRight: function (length, padding) {
        var str = this;
        while (str.length < length) {
            str = str + padding;
        }

        return str.substring(0, length);
    },

    strip: function () {
        return String(this).replace(/^\s+|\s+$/g, '');
    },

    asObject: function () {
        return JSON.parse(this);
    }
}, String.prototype);
