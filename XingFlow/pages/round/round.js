// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
	"use strict";
	
	WinJS.UI.Pages.define("/pages/round/round.html", {
	    // This function is called whenever a user navigates to this page. It
	    // populates the page elements with the app's data.
	    ready: function (element, options) {
	    	// TODO: Initialize the page here.
	    	document.addEventListener('click', function (e) {
	    		/*if (e.target.id == "ASel") {
	    			//document.getElementById("testingcrap").innerHTML = "12345";
	    		} else {
	    			//document.getElementById("testingcrap").innerHTML = "shaba";
	    		}*/
	    		SelectBox(e.target.id);
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
	function SelectBox(elid) {

		if (elid == "Continue") {
			StartRound();
			return;
		}

		var el = document.getElementById("L" + elid);
		if(el == null){
			return;
		}
		if (el.id == "LASel") {
			el.style.background = "green";
			document.getElementById("LNSel").style.background = "transparent";
		} else if (el.id == "LNSel") {
			el.style.background = "red";
			document.getElementById("LASel").style.background = "transparent";
		} else if (el.id == "L1Sel") {
			el.style.background = "lightblue";
			el.style.color = "black";
			document.getElementById("L2Sel").style.background = "transparent";
		} else if (el.id == "L2Sel") {
			el.style.background = "darkblue";
			document.getElementById("L1Sel").style.background = "transparent";
			document.getElementById("L1Sel").style.color = "white";
		}
	
		if ((document.getElementById("ASel").checked || document.getElementById("NSel").checked) &&		(document.getElementById("1Sel").checked || document.getElementById("2Sel").checked)) {
			//All selected; show continue button
			document.getElementById("Continue").style.display = "block";
		}
	}

	function StartRound() {
		var roundInfo = {
			isReal: true,
			isPre: false,
			isAff: true,
			is1st: true
		};
		if (document.getElementById("NSel").checked) {
			roundInfo["isAff"] = false;
		}
		if (document.getElementById("2Sel").checked) {
			roundInfo["is1st"] = false;
		}
		WinJS.Navigation.navigate("/pages/flow/flow.html", roundInfo);
	}
})();
