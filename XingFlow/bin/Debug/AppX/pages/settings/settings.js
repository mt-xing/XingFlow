// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/settings/settings.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
        	// TODO: Initialize the page here.
        	document.addEventListener('click', function (e) {
        		HasClicked(e.target.id);
        	});
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
    function HasClicked(elid) {
    	if (elid == "AFlow") {
    		var roundInfo = {
    			isReal: true,
    			isPre: true,
    			isAff: true
    		};
    		WinJS.Navigation.navigate("/pages/flow/flow.html", roundInfo);
    	} else if (elid == "NFlow") {
    		var roundInfo = {
    			isReal: true,
    			isPre: true,
    			isAff: false
    		};
    		WinJS.Navigation.navigate("/pages/flow/flow.html", roundInfo);
    	}
    }
})();
