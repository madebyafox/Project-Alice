# Project-Alice
Taming the madness of exploratory search


## WORKING
* logging windows & tab structure (on initialization) to indexedDB
* logging Windows and Tabs events to indexedDB
* logging webNav (main frame, completed) to indexedDB
* export database to file
* toggl logging status on/off
* clear db on demmand
* track toggles in logging
* let user designate start/end of a "search session"
* log a user identifier
* support realtime annotation

## FIXED
* contentscripts are injected on onActivated, and de-activated / re-activating the extension results in multiple copies of the annotation modal being injected on existing pages. No impact to functionality, but clutters the DOM.
see https://stackoverflow.com/questions/53939205/how-to-avoid-extension-context-invalidated-errors-when-messaging-after-an-exte for possible approach to solution --> FIXED by adding destructor events to contentscript

##KNOWN ISSUES
* annotation modal style can be overriden by source page styles, which can lead to erroneous styling (for example: on stack overflow). Recommend replacing modal code with an encapuslated webcomponent using a shadowDom (eg. semantic ui)

* annotate.html page doesn't support hide on esc or click background, because the modal is declared on the html page and not with the bootstrap js options. --> investigate why $("#backdrop").on("click", function(){ isn't working 

* onActivated injection approach leads to errors when triggered on chrome pages (not allowable scheme). The newpage-> annotation flow is triggered and works, but onActivated logic should filter on url so it isn't triggered on inelligible pages
(see error : Unchecked runtime.lastError: Cannot access contents of url "chrome-extension://laookkfknpbbblfpciffpaejjkokdgca/dashboard.html". Extension manifest must request permission to access this host.
Context)
* css funky on some pages (like stack overflow)







launch analytics



*Thanks to webpack boilerplate https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate*
