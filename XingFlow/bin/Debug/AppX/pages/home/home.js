(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
        	// TODO: Initialize the page here.
        	WinJS.Utilities.query("a").listen("click", this.linkClickEventHandler, false);
        	WinJS.Utilities.query("a").listen("mousedown", this.linkDownHandler, false);
        	WinJS.Utilities.query("a").listen("pointerout", this.linkUpHandler, false);
        },

        linkClickEventHandler: function (eventInfo) {
        	eventInfo.preventDefault();
        	var link = eventInfo.target;
        	if (link.className != "ALink") {
        		link = link.parentElement;
        	}
			WinJS.UI.Animation.pointerUp(link).done(
				function completed() {
					if (link.getAttribute("data-round") == "false") {
						WinJS.Navigation.navigate(link.href, { isRound: false, isReal: false });
					} else {
						WinJS.Navigation.navigate(link.href, { isReal: false, isRound: false });
					}
				});
        	
        },
    	linkDownHandler: function (eventInfo) {
    		eventInfo.preventDefault();
    		var link = eventInfo.target;
    		if (link.className != "ALink") {
    			link = link.parentElement;
    		}
    		WinJS.UI.Animation.pointerDown(link).done();
    	},
    	linkUpHandler: function (eventInfo) {
    		eventInfo.preventDefault();
    		var link = eventInfo.target;
    		if (link.className != "ALink") {
    			link = link.parentElement;
    		}
    		WinJS.UI.Animation.pointerUp(link).done();
    	}
    });
})();
