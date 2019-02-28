"use strict"

/*
    WebBrowserNotifications
    Simple interface to browser notifications. Takes care of:
    - only checking for permissions once
    - sending any waiting notifications after permission is gained
    - notification timeouts

    Todo: 
    - support for multiple waiting notes? waiting note limit
    - add any abstractions specific to special Chrome/Android notifications

    example use:

    WebBrowserNotifications.shared().newNote().setTitle("hello").setBody("...").tryToPost()

*/

window.WebBrowserNotifications = ideal.Proto.extend().newSlots({
    type: "WebBrowserNotifications",
    permissionRequestResult: null,
    waitingNote: null,
}).setSlots({
    init: function () {
        throw new Error("this class is meant to be used as singleton, for now")
        return this
    },

    shared: function () {
        return this
    },

    hasPermission: function () {
        return this.permissionRequestResult() == "granted"
    },

    wasDenied: function () {
        return this.permissionRequestResult() == "denied"
    },

    hasAskedForPermission: function () {
        return this.permissionRequestResult() != null
    },

    requestPermissionIfNeeded: function () {
        if (!this.hasAskedForPermission()) {
            this.requestPermission()
        }
        return this
    },

    requestPermission: function () {
        Notification.requestPermission().then((result) => {
            this.setPermissionRequestResult(result)
            console.log("requestPermission:", result);
            this.postWaitingNotes()
        });
        Notification.requestPermission();
    },

    isSupported: function() {
        return ("Notification" in window)
    },

    postNote: function (aNote) {
        this.setWaitingNote(aNote)

        if (!this.isSupported()) {
            return this
        }

        this.requestPermissionIfNeeded() // will call this.postWaitingNotes()

        if (this.hasPermission()) {
            this.postWaitingNotes()
        }

        return this
    },

    postWaitingNotes: function() {
        if (this.waitingNote()) {
            this.waitingNote().tryToPost()
            this.setWaitingNote(null)
        }
        return this
    },

    newNote: function() {
        return WebBrowserNotification.clone()
    },
})

// --------------------------------------

window.WebBrowserNotification = ideal.Proto.extend().newSlots({
    type: "WebBrowserNotification",
    title: "",
    body: null,
    icon: null, // a url to an image
    notificationRef: null,
    timeoutMs: 4000,
}).setSlots({
    init: function () {
        return this
    },

    tryToPost: function() {
        WebBrowserNotifications.postNote(this)
        return this
    },

    justPost: function() {
        let note = new Notification(this.title(), { body: this.body(), icon: this.icon() });
        this.setNotificationRef(note)
        this.startTimeout()
        return this
    },

    startTimeout: function() {
        setTimeout(notification.close.bind(this.notificationRef()), this.timeoutMs());
    },

})

