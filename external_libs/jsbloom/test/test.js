var assert = require("chai").assert,
    expect = require("chai").expect,
    JSBloom = require("../bloom.js"),
    filter = new JSBloom.filter(10000, 1E-10),
    generator = function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) { var r = Math.random()*16|0, v = c === "x" ? r : (r&0x3|0x8); return v.toString(16); });
    };

global.btoa = function (str) {return new Buffer(str).toString("base64");};

describe("JSBloom - Bloom Filter", function() {

    var test_entries = [],
        false_entries = [],
        importData = "AwGl7SOrZ+6IcpqXrZj2u5/vQg4o0k8syi6q2m+uxh5p1l9tzj7r3n/voIHChokeLGSJ0qbJny5iigGYATEo0Ktmndr26D+o4ZPGzpi+YgBGS3av3HD509cv3bzx+9ffP/36BAcFBoSHhYZER0VGxMfFxiQnJSakp6WmZGdlZuTn5eYUFxUWlJeVllRXVVbU19XWNDc1NrS3tbZ0d3V29Pf19gwPDQ6Mj42OTE9NTszPzc4sLy0urK+trmxsN1qoAHFuH20cnx2eLACyn1+e3N/d3jw/PT68v72+fH99fvz//f0BAOBQNBIPBYMhEOhUNhMPhcMRCORSNRKPRaMxGOxWNxOPxeMJBOJRNJJPJZMpFOpVNpknUdMZNOZTLx1gAbCyuazubyefy+YKBcKhaKReKxZKJdKpbKZfK5YqFcqlaqVeq1ZqNdqtbqdfq9YaDcajaaTeazZaLdarbaNQcbY67c6Neyrk6PS6vZ6fd6/b6A/6g4GQ8Gw6GI+Go5GY9G47GE/Gk4mU8m06mM+ms5mc9m87mTW788WCyXQmoy6Wq5XArZq/Waw2m42W82262O+2u52e92+72B/2h4OR8Ox6OJ+Op5OZ9O57OF/Ol4I64u18vc7sHeudxuo+7d4e98ej6eT+ez5eL9er7eb/e74+H8+n6+X++35+P9+v7+f/+/0NA8AJAwCqQZMDINAtEOSguDoPgxCEOQpDUJQ9C0MwjDsKw3CcPwvDCII4iiJHVcSIo0jKOoqjclgmiGNolpt0Y1imPYtjOI47iuN4nj+L4wSBOEoTRJE8SxMkiTpKk2SZPkuTFIU5SFiLJT1JU0QKw0nTNN0/S9MMgzjKM0yTPMszLIs6yrNsmz7LsxyHOcpzXKxLc3M8pTyK83y+I8lzAr84KgtCkLwrCyKIuiqLYpi+K4sShLkqS1KUvStLMtIAKMtygDgLywqPwgrLSqK8qysqirqqq2qavqurGoa5qmtalr2razqOu6yiSp6/r23ogbhobFiRvGrrJom6aptmmb5rmxaFuWpbVpW9a1s2jbtq2gCxt2nawzUw6DsTbSTou07Luuq7bpu+67seh7nqe16Xvet7xCAA";

    describe("Errors", function() {
        it("should throw an error when instantiated without arguments", function() {

            expect(function() {
                new JSBloom.filter();
            }).to.throw(Error);

        });
    });

    describe("Insertion", function() {
        it("should insert 1000 random elements individually without error", function() {
            for (var i = 1000 - 1; i >= 0; i--) {
                var rand_string = generator();

                test_entries.push(rand_string);

                assert.equal(filter.addEntry(rand_string), true);
            };
        });

        it("should insert 1000 random elements in an array without error", function() {

            var arr = [];

            for (var i = 1000 - 1; i >= 0; i--) {

                var rand_string = generator();

                arr.push(rand_string);

            };

            test_entries = test_entries.concat(arr);

            assert.equal(filter.addEntries(arr), true);

        });
    });

    describe("Existence", function() {
        it("should return true for 2000 added elements", function() {
            for (var i = test_entries.length - 1; i >= 0; i--) {
                assert.equal(filter.checkEntry(test_entries[i]), true);
            };
        });

    });

    describe("Duplicate Insertion", function() {
        it("should return true for 2000 added elements", function() {
            for (var i = test_entries.length - 1; i >= 0; i--) {
                assert.equal(filter.addEntry(test_entries[i]), false);
            };
        });

    });


    describe("Non-Existence", function() {
        it("should return false for 1000 non elements", function() {
            var positive = 0;
            for (var i = 1000 - 1; i >= 0; i--) {
                if(filter.checkEntry(generator()))
                    positive ++;
            };
            assert.ok(positive <= 10, "should have had less than 10 positive tests, but had:"+positive);
        });

    });



    describe("Import & Export", function() {
        it("should return true on predefined element in imported array", function() {
            filter.importData(importData);

            assert.equal(filter.checkEntry("5a4f3bdf-476c-45e9-bd78-ab13ccc47255"), true);
        });

        it("should return expected output on export", function() {
            this.timeout(0);

            assert.equal(filter.exportData(), importData);
        });

        it("should return expected output to callback on export", function() {
            this.timeout(0);

            filter.exportData(function (s) {
                assert.equal(s, importData);
            });

        });

    });

});






