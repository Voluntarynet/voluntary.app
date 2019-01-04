

// register

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(function (registration) {
            // Registration was successful
            console.log("ServiceWorker registration successful with scope: ", registration.scope);
        }, function (err) {
            // registration failed :(
            console.log("ServiceWorker registration failed: ", err);
        });
    });
}


// install

self.addEventListener("install", function (event) {
    // Perform install steps

    /*
    Open a cache.
    Cache our files.
    Confirm whether all the required assets are cached or not.
    */

    var CACHE_NAME = "my-site-cache-v1";
    var urlsToCache = [
        "/",
        "/styles/main.css",
        "/script/main.js"
    ];

    self.addEventListener("install", function (event) {
    // Perform install steps
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(function (cache) {
                    console.log("Opened cache");
                    return cache.addAll(urlsToCache);
                })
        );
    });

});


/*
Cache and return requests
Now that you've installed a service worker, you probably want to return one of your cached responses, right?

After a service worker is installed and the user navigates to a different page or refreshes, the service worker will begin to receive fetch events, an example of which is below.
*/


self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== "basic") {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

/*
Update a service worker
There will be a point in time where your service worker will need updating. When that time comes, you'll need to follow these steps:

Update your service worker JavaScript file. When the user navigates to your site, the browser tries to redownload the script file that defined the service worker in the background. If there is even a byte's difference in the service worker file compared to what it currently has, it considers it new.
Your new service worker will be started and the install event will be fired.
At this point the old service worker is still controlling the current pages so the new service worker will enter a waiting state.
When the currently open pages of your site are closed, the old service worker will be killed and the new service worker will take control.
Once your new service worker takes control, its activate event will be fired.
One common task that will occur in the activate callback is cache management. The reason you'll want to do this in the activate callback is because if you were to wipe out any old caches in the install step, any old service worker, which keeps control of all the current pages, will suddenly stop being able to serve files from that cache.

Let's say we have one cache called 'my-site-cache-v1', and we find that we want to split this out into one cache for pages and one cache for blog posts. This means in the install step we'd create two caches, 'pages-cache-v1' and 'blog-posts-cache-v1' and in the activate step we'd want to delete our older 'my-site-cache-v1'.

The following code would do this by looping through all of the caches in the service worker and deleting any caches that aren't defined in the cache whitelist.
*/

self.addEventListener("activate", function(event) {

    var cacheWhitelist = ["pages-cache-v1", "blog-posts-cache-v1"];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

