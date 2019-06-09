
/*
self.addEventListener("install", function(event) {
    console.log("Installed sw.js", event);
});

self.addEventListener("activate", function(event) {
    console.log("Activated sw.js", event);
});
*/



// service-worker.js

// Path is relative to the origin.
const OFFLINE_PAGE_URL = "index.html";
// We"ll add more URIs to this array later.
const ASSETS_TO_BE_CACHED = [OFFLINE_PAGE_URL];

self.addEventListener("install", event => {
    event.waitUntil(
        // The Cache API is domain specific and allows an app to create & name 
        // various caches it"ll use. This allows for better data organization.
        // Under each named cache, we"ll add our key-value pairs.
        caches.open("my-service-worker-cache-name").then((cache) => {
            // addAll() hits (GET request) all the URIs in the array and caches 
            // the results, with the URIs as the keys.
            cache.addAll(ASSETS_TO_BE_CACHED)
                .then(() => console.log("Assets added to cache."))
                .catch(err => console.log("Error while fetching assets", err));
        })
    );
});

self.addEventListener("fetch", (e) => {
    // All requests made to the server will pass through here.
    const response = fetch(e.request)
        .then((response) => response)
        // If one fails, return the offline page from the cache.
        // caches.match doesn"t require the name of the specific
        // cache in which the key is located. It just traverses all created
        // by the current domain and fetches the first one.
        .catch(() => caches.match(OFFLINE_PAGE_URL));

    e.respondWith(response);
});


