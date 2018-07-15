"use strict"

/*
    PeriodFormatter 
    takes a number of seconds and formats in a compact format

	example use:

	var stringVersion = PeriodFormatter.clone().setValueInSeconds(seconds).formattedValue()

	example output:

	if seconds was 10, stringVersion would be 10s.
	if seconds was 60, stringVersion would be 1m.
	if seconds was 3600, stringVersion would be 1h.
	if seconds was 172800, stringVersion would be 2d.
	etc.

*/

class PeriodFormatter extends ProtoClass {
    init() {
        super.init()
    }

    formattedValue() {
        var periods = {
            seconds: "s", 
            minutes: "m", 
            hours: "h", 
            days: "d", 
            months: "months", 
            years: "years"
        }

        let seconds = this.valueInSeconds()
        if (seconds === null) {
            return "?"
        }

        if (seconds < 60) {
            return Math.floor(seconds) + periods.seconds
        }
        
        let minutes = Math.floor(seconds/60)
        if (minutes < 60) {
            return minutes + periods.hours
        }

        let hours = Math.floor(minutes/60)
        if (hours < 24) {
            return hours + periods.hours
        }
        
        let days = Math.floor(hours/24)
        return days + periods.days
    }
}

PeriodFormatter.newSlots({
    valueInSeconds: 0,
}).setSlots({
    
})


PeriodFormatter.registerThisClass()
