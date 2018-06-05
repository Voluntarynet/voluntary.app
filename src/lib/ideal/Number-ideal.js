"use strict"

Object.shallowCopyTo({
    /*
    milliseconds: function () {
        return this;
    },

    seconds: function () {
        return Number(this) * 1000;
    },

    minutes: function () {
        return this.seconds() * 60;
    },

    hours: function () {
        return this.minutes() * 60;
    },

    days: function () {
        return this.hours() * 24;
    },

    years: function () {
        return this.days() * 365;
    },
    */

    repeat: function (callback) {
        for (let i = 0; i < this; i++) {
            if (callback(i) === false) {
                return this;
            }
        }
        return this;
    },

    map: function () {
        var a = [];
        for (let i = 0; i < this; i++) {
            a.push(i);
        }
        return Array.prototype.map.apply(a, arguments);
    },

    isEven: function () {
        return this % 2 == 0;
    },

    isOdd: function () {
        return this % 2 != 0;
    },
}, Number.prototype);
