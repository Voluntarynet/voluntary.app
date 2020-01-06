"use strict"

/*

    String-ideal

    Some extra methods for the Javascript String primitive.

*/

Object.defineSlots(String.prototype, {
    
    shallowCopy: function() {
        return this
    },

    duplicate: function() {
        return this
    },
    
    isEmpty: function () {
        return this.length === 0;
    },

    beginsWith: function (prefix) {
        if (!prefix) return false;
        return this.indexOf(prefix) === 0;
    },

    endsWith: function (suffix) {
        const index = this.lastIndexOf(suffix);
        return (index !== -1) && (this.lastIndexOf(suffix) === this.length - suffix.length);
    },

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
        let result = "";
        const aString = this;
        times.repeat(function () { result += aString });
        return result
    },

    sansPrefixes: function(aStringList) {
        let result = this
        aStringList.forEach((s) => { result = result.sansPrefix(s) })
        return result
    },

    sansPrefix: function (prefix) {
        return this.substring(this.beginsWith(prefix) ? prefix.length : 0);
    },

    sansSuffixes: function(aStringList) {
        let result = this
        aStringList.forEach((s) => { result = result.sansSuffix(s) })
        return result
    },

    sansSuffix: function (suffix) {
        if (this.endsWith(suffix)) {
            return this.substr(0, this.length - suffix.length);
        }
        else {
            return this;
        }
    },

    stripped: function () {
        return this.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
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
        const words = [];
        let start = -1;
        const capitalized = this.capitalized();
        for (let i = 0; i < capitalized.length; i++) {
            if (capitalized.slice(i, i + 1).match(/[A-Z]/)) {
                let word = capitalized.slice(start, i);
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
        return this.base64Encoded().replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, ",");
    },

    base64Decoded: function () {
        return new Buffer(String(this), "base64").toString("utf8");
        //return atob(this);
    },

    base64UrlDecoded: function () {
        return this.replace(/-/g, "+").replace(/_/g, "/").replace(/,/g, "=").base64Decoded();
    },

    stringCount: function (str) {
        return this.split(str).length - 1;
    },

    lineCount: function () {
        return this.stringCount("\n");
    },

    // --- paths ---

    pathComponents: function () {
        if (this === "/") {
            return [""];
        }
        else if (this === "") {
            return [];
        }
        else {
            return this.split("/");
        }
    },

    sansLastPathComponent: function () {
        const c = this.pathComponents()
        c.removeLast();
        return c.join("/");
    },

    lastPathComponent: function () {
        return this.pathComponents().last();
    },

    fileName: function() {
        return this.lastPathComponent().sansExtension()
    },

    sansExtension: function () {
        const parts = this.split(".")
        if (parts.length > 1) {
            parts.pop()
        }
        return parts.join(".")
    },

    pathExtension: function() {
        const extension = this.split(".").last();
        return extension;
    },

    // --- pad / strip -------

    padLeft: function (length, padding) {
        let str = this;
        while (str.length < length) {
            str = padString + str;
        }

        return str.substring(0, length);
    },

    padRight: function (length, padding) {
        let str = this;
        while (str.length < length) {
            str = str + padding;
        }

        return str.substring(0, length);
    },

    strip: function () {
        return String(this).replace(/^\s+|\s+$/g, "");
    },

    asObject: function () {
        return JSON.parse(this);
    },

    capitalized: function () {
        return this.replace(/\b[a-z]/g, function (match) {
            return match.toUpperCase();
        });
    },

    /// String

    asSetter: function () {
        return "set" + this.capitalized();
    },

    firstCharacter: function () {
        return this.slice(0);
    },

    lastCharacter: function () {
        return this.slice(-1);
    },

    capitalizeWords: function () {
        return this.replace(/(?:^|\s)\S/g, function (a) {
            return a.toUpperCase();
        });
    },

    replaceAll: function (target, replacement) {
        return this.split(target).join(replacement);
    },

    loremIpsum: function (minWordCount, maxWordCount) {
        if (!minWordCount) { minWordCount = 10; }
        if (!maxWordCount) { maxWordCount = 40; }

        const loremIpsumWordBank = new Array("lorem", "ipsum", "dolor", "sit", "amet,", "consectetur", "adipisicing", "elit,", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua.", "enim", "ad", "minim", "veniam,", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat.", "duis", "aute", "irure", "dolor", "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur.", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident,", "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum.", "sed", "ut", "perspiciatis,", "unde", "omnis", "iste", "natus", "error", "sit", "voluptatem", "accusantium", "doloremque", "laudantium,", "totam", "rem", "aperiam", "eaque", "ipsa,", "quae", "ab", "illo", "inventore", "veritatis", "et", "quasi", "architecto", "beatae", "vitae", "dicta", "sunt,", "explicabo.", "nemo", "enim", "ipsam", "voluptatem,", "quia", "voluptas", "sit,", "aspernatur", "aut", "odit", "aut", "fugit,", "sed", "quia", "consequuntur", "magni", "dolores", "eos,", "qui", "ratione", "voluptatem", "sequi", "nesciunt,", "neque", "porro", "quisquam", "est,", "qui", "dolorem", "ipsum,", "quia", "dolor", "sit,", "amet,", "consectetur,", "adipisci", "velit,", "sed", "quia", "non", "numquam", "eius", "modi", "tempora", "incidunt,", "ut", "labore", "et", "dolore", "magnam", "aliquam", "quaerat", "voluptatem.", "ut", "enim", "ad", "minima", "veniam,", "quis", "nostrum", "exercitationem", "ullam", "corporis", "suscipit", "laboriosam,", "nisi", "ut", "aliquid", "ex", "ea", "commodi", "consequatur?", "quis", "autem", "vel", "eum", "iure", "reprehenderit,", "qui", "in", "ea", "voluptate", "velit", "esse,", "quam", "nihil", "molestiae", "consequatur,", "vel", "illum,", "qui", "dolorem", "eum", "fugiat,", "quo", "voluptas", "nulla", "pariatur?", "at", "vero", "eos", "et", "accusamus", "et", "iusto", "odio", "dignissimos", "ducimus,", "qui", "blanditiis", "praesentium", "voluptatum", "deleniti", "atque", "corrupti,", "quos", "dolores", "et", "quas", "molestias", "excepturi", "sint,", "obcaecati", "cupiditate", "non", "provident,", "similique", "sunt", "in", "culpa,", "qui", "officia", "deserunt", "mollitia", "animi,", "id", "est", "laborum", "et", "dolorum", "fuga.", "harum", "quidem", "rerum", "facilis", "est", "et", "expedita", "distinctio.", "Nam", "libero", "tempore,", "cum", "soluta", "nobis", "est", "eligendi", "optio,", "cumque", "nihil", "impedit,", "quo", "minus", "id,", "quod", "maxime", "placeat,", "facere", "possimus,", "omnis", "voluptas", "assumenda", "est,", "omnis", "dolor", "repellendus.", "temporibus", "autem", "quibusdam", "aut", "officiis", "debitis", "aut", "rerum", "necessitatibus", "saepe", "eveniet,", "ut", "et", "voluptates", "repudiandae", "sint", "molestiae", "non", "recusandae.", "itaque", "earum", "rerum", "hic", "tenetur", "a", "sapiente", "delectus,", "aut", "reiciendis", "voluptatibus", "maiores", "alias", "consequatur", "aut", "perferendis", "doloribus", "asperiores", "repellat");

        const randy = Math.floor(Math.random() * (maxWordCount - minWordCount)) + minWordCount;
        let ret = "";
        let needsCap = true
        for (let i = 0; i < randy; i++) {
            let newTxt = loremIpsumWordBank[Math.floor(Math.random() * (loremIpsumWordBank.length - 1))];

            if (ret.substring(ret.length - 1, ret.length) === "." || ret.substring(ret.length - 1, ret.length) === "?") {
                newTxt = newTxt.substring(0, 1).toUpperCase() + newTxt.substring(1, newTxt.length);
            }

            if (needsCap) {
                newTxt = newTxt.capitalized()
                needsCap = false
            }

            ret += " " + newTxt;
        }

        return ret + "."
    },

    escapeHtml: function () {
        return this.replace(/[&<>"'\/]/g, function (s) {
            const entityMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;",
                "/": "&#x2F;"
            };
            return entityMap[s];
        });
    },

    GUID: function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
            s4() + "-" + s4() + s4() + s4();
    },

});






