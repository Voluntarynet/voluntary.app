"use strict"

/*

    Date-ideal

    Some extra methods for the Javascript Date primitive.

*/

Object.defineSlots(Date.prototype, {

    /*
    clone: function () {
        return new Date(this.getTime())
    },
    */

    copy: function() {
        return this.shallowCopy()
    },

    shallowCopy: function() {
        return new Date(this.getTime())
    },

    // ---
   
    monthNames: function() {
        return [ 
            "January", "February", "March", 
            "April", "May", "June", 
            "July", "August", "September", 
            "October", "November", "December" 
        ];
    },

    monthName: function () {
        const monthNumber = this.getMonth() - 1
        return this.monthNames()[monthNumber];
    },

    dateNumberName: function() {
        const dayNumber = this.getDate()
        return dayNumber + dayNumber.ordinalSuffix()
    },

    paddedNumber: function(n) {
        const s = "" + n
        if (s.length === 1) { 
            return "0" + s
        }
        return s
    },

    zeroPaddedHours: function() {
        return this.paddedNumber(this.getHours())
    },

    zeroPaddedMinutes: function() {
        return this.paddedNumber(this.getMinutes())
    },

    zeroPaddedSeconds: function() {
        return this.paddedNumber(this.getSeconds())
    },

    getTwelveHours: function() {
        let h = this.getHours()
        if (h > 12) { h -= 12 }
        if (h === 0) { h = 12 }
        return h
    },

    zeroPaddedUSDate: function() {
        return this.paddedNumber(this.getTwelveHours()) + ":" + this.paddedNumber(this.getMinutes())
    },

});






