"use strict"

/*

    WebBrowserNotification


*/

ideal.Proto.newSubclassNamed("WebBrowserNotification").newSlots({
    title: "",
    body: null,
    icon: null, // a url to an image
    notificationRef: null,
    timeoutMs: 4000,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        return this
    },

    tryToPost: function() {
        WebBrowserNotifications.postNote(this)
        return this
    },

    justPost: function() {
        const note = new Notification(this.title(), { body: this.body(), icon: this.icon() });
        this.setNotificationRef(note)
        this.startTimeout()
        return this
    },

    startTimeout: function() {
        setTimeout(notification.close.bind(this.notificationRef()), this.timeoutMs());
    },

})



