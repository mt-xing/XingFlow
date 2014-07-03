(function () {
	"use strict";
	
	var Fields = 1;
	var ContNum = 0;
	
	WinJS.UI.Pages.define("/pages/item/item.html", {
	    // This function is called whenever a user navigates to this page. It
	    // populates the page elements with the app's data.
	    ready: function (element, options) {
	        //var item = Data.resolveItemReference(options.item);
	        //element.querySelector(".titlearea .pagetitle").textContent = item.title;
	
	    	// TODO: Initialize the page here.
	    	document.addEventListener('keydown', function (e) {
	    		var TextField = document.activeElement;
	    		if (e.keyCode == WinJS.Utilities.Key.tab) {
	    			e.preventDefault();
	    		} else if (e.keyCode == WinJS.Utilities.Key.backspace && TextField.value == "" && TextField.id != "Input1" &&	TextField.tagName == "INPUT") {
	    			DeleteField();
	    		} else if (e.keyCode == WinJS.Utilities.Key.enter) {
	    			NewField();
	    		} else if (e.keyCode == WinJS.Utilities.Key.upArrow && TextField.id != "Input1" && TextField.tagName == "INPUT") {
	    			MoveUp();
	    		} else if (e.keyCode == WinJS.Utilities.Key.downArrow && TextField.id != ("Input" + Fields) && TextField.tagName	== "INPUT") {
	    			MoveDown();
	    		}
	    	});
	
	    	document.addEventListener('keyup', function (e) {
	    		var itm = e.srcElement;
	    		var TextField = document.activeElement;
	    		if (e.ctrlKey && e.keyCode === WinJS.Utilities.Key.tab) {
	    			ChangePage();
	    		} else if(e.shiftKey && e.keyCode == WinJS.Utilities.Key.tab && TextField.tagName == "INPUT"){
	    			IndentOut();
	    		} else if (e.keyCode == WinJS.Utilities.Key.tab && doGetCaretPosition(document.activeElement) == 0 &&	TextField.tagName == "INPUT") {
	    			IndentIn();
	    		} else if (e.altKey && e.keyCode == WinJS.Utilities.Key.c && TextField.tagName == "INPUT" &&	(TextField.getAttribute("data-cont") == 0 || TextField.getAttribute("data-cont") == "")) {
	    			CreateContention();
	    		} else if (e.altKey && e.keyCode == WinJS.Utilities.Key.c && TextField.tagName == "INPUT" &&	TextField.getAttribute("data-cont") != 0) {
	    			DeleteContention();
	    		}
	    	});
	    }
	});
	
	function ChangePage() {
    	var TitleField = document.getElementById("AffNeg");
    	if (TitleField.innerText == "Affirmative") {
    		TitleField.innerText = "Negative";
    	} else {
    		TitleField.innerText = "Affirmative";
    	}
    }
	
	function NewField() {
		var PC = document.getElementById("MainContent");
		//PC stands for Page Content
		var ElNum = DetElNum();
		//Element Number
		var El = document.activeElement;
	
		Fields++;
		//Number of fields after operation
	
		if (Fields > (ElNum + 1)) {
			for (var i = (Fields - 1) ; i > ElNum; i--) {
				document.getElementById("Input" + i).id = "Input" + (i + 1);
			}
		}
	
		var input = document.createElement("input");
		input.type = "text";
		input.id = "Input" + (ElNum + 1);
		input.setAttribute("data-indent", 0);
		input.setAttribute("data-cont", 0);


		if (Number(El.getAttribute("data-incont")) != 0) {
			input.setAttribute("data-incont", Number(El.getAttribute("data-incont")));
		} else if (Number(El.getAttribute("data-cont")) != 0) {
			input.setAttribute("data-incont", Number(El.getAttribute("data-cont")));
		} else {
			input.setAttribute("data-incont", 0);
		}

		if (document.getElementById("Input" + (ElNum + 2)) == null) {
			PC.appendChild(input);
		} else if (Number(document.getElementById("Input" + (ElNum + 2)).getAttribute("data-cont")) == 0) {
			PC.insertBefore(input, document.getElementById("Input" + (ElNum + 2)));
		} else {
			PC.insertBefore(input, document.getElementById("Cont" + (Number(document.getElementById("Input" + (ElNum +	2)).getAttribute("data-cont")))));
		}
		document.getElementById("Input" + (ElNum + 1)).focus();
	
		if (Number(El.getAttribute("data-cont")) != 0){
			IndentIn();
		} else if (Number(El.getAttribute("data-indent")) != 0) {
			for (var i = 0; i < El.getAttribute("data-indent") ; i++) {
				IndentIn();
			}
		}
		
	}
	function DeleteField() {
    	var IDNum = DetElNum();
    	document.activeElement.parentNode.removeChild(document.activeElement);
		
    	if (Fields != IDNum) {
    		for (var i = (IDNum + 1) ; i <= Fields; i++) {
    			document.getElementById("Input" + i).id = "Input" + (i - 1);
    		}
    	}

    	Fields--;
    	document.getElementById("Input" + (IDNum - 1)).focus();
    }
	
	function MoveUp() {
    	var ElNum = DetElNum();
    	document.getElementById("Input" + (ElNum - 1)).focus();
    }
	function MoveDown() {
    	var ElNum = DetElNum();
    	document.getElementById("Input" + (ElNum + 1)).focus();
    }
	
	function IndentIn() {
    	var CurrAtt = Number(document.activeElement.getAttribute("data-indent"));
    	if (CurrAtt == NaN) {
    		CurrAtt = 0;
    	}
    	CurrAtt++;
    	
    	//document.activeElement.style.left = "0px";
    	var Amount = 50 * CurrAtt;
		Amount += "px";
		document.activeElement.style.left = Amount;
		document.activeElement.style.width = "calc(99% - " + (50 * CurrAtt) + "px)";
    	document.activeElement.setAttribute("data-indent", CurrAtt);
    }
	function IndentOut() {
    	var CurrAtt = Number(document.activeElement.getAttribute("data-indent"));
    	CurrAtt--;
    	if (CurrAtt < 0) {
    		return;
    	}
    	document.activeElement.style.left = (50 * CurrAtt) + "px";
    	document.activeElement.style.width = "calc(99% - " + (50 * CurrAtt) + "px)";
    	document.activeElement.setAttribute("data-indent", CurrAtt);
    }
	
	function CreateContention() {
		var El = document.activeElement;
		//El = Element
		
		El.setAttribute("data-incont", 0);
		var ThisCont = ContNum + 1;
		
		if (DetElNum() < Fields) {
			//If the field you're cont-ing isn't the last field...
			if(Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-incont") != 0)){
				//If the next element is in another contention already,
				//Deal with it
				ThisCont = 1 + Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-incont"));
			}
	
			if(ThisCont < (ContNum + 1)){
				//If this contention isn't the newest contention
				for (var i = ThisCont; i <= ContNum; i++) {
					var ContMark = document.getElementById("Cont" + i);
					ContMark.id = "Cont" + (i + 1);
					ContMark.innerText = Number(ContMark.innerText) + 1;
					//Change the contention markers	
				}
				
				//var DOMArray = document.getElementsByTagName("INPUT");
				for (var j = (DetElNum() + 1); j <= Fields; j++) {
					var ValueHolder = Number(document.getElementById("Input" + j).getAttribute("data-incont"));
					if (ValueHolder >= (ThisCont - 1)) {
						document.getElementById("Input" + j).setAttribute("data-incont", (ValueHolder + 1));
						//Change the In Contention attributes...
					}

					var OtherValueHolder = Number(document.getElementById("Input" + j).getAttribute("data-cont"));
					if (OtherValueHolder >= (ThisCont - 1)) {
						document.getElementById("Input" + j).setAttribute("data-cont", (OtherValueHolder + 1));
						//Or for the contention headers, the Contention attribute itself
					}
				}
			}

			for (var i = (DetElNum() + 1) ; i <= Fields; i++) {
				var Ele = document.getElementById("Input" + i);
				if (Number(Ele.getAttribute("data-incont")) == 0 && Number(Ele.getAttribute("data-cont")) == 0) {
					Ele.setAttribute("data-incont", ThisCont);
				}
			}

		}
	
		var InNum = document.createElement("h1");
		InNum.id = "Cont" + ThisCont;
		//InNum.innerHTML = "<h1>" + ContNum + "</h1>";
		InNum.innerText = ThisCont;
		InNum.style.position = "absolute";
		InNum.style.left = "90px";
		El.setAttribute("data-cont", ThisCont);
		El.style.padding = "15px 0";
		El.style.marginTop = "25px";
		InNum.style.marginTop = "25px";
		if (Number(El.getAttribute("data-indent")) != 0) {
			El.setAttribute("data-indent", 0);
			El.style.left = 0;
			El.style.width = "99%";
		}
		document.getElementById("MainContent").insertBefore(InNum, El);
		ContNum++;
	}
	function DeleteContention() {
		var El = document.activeElement;
		//El = Element
	
		El.setAttribute("data-cont", 0);
		El.style.padding = "0";
		document.getElementById("MainContent").removeChild(document.getElementById("Cont" + ContNum));
	
		ContNum--;
	}
	
	
	
	//Determines Element Number
	function DetElNum() {
    	if (document.activeElement.tagName != "INPUT") {
    		return Fields;
    	}

    	if (document.activeElement.id.length == 6) {
    		var ElNum = Number(document.activeElement.id[5]);
    	} else {
    		var ElNum = Number(document.activeElement.id[5] + document.activeElement.id[6]);
    	}
    	return ElNum;
    }
	
	/*
	** Returns the caret (cursor) position of the specified text field.
	** Return value range is 0-oField.value.length.
	*/
	function doGetCaretPosition(oField) {

    	// Initialize
    	var iCaretPos = 0;

    	// IE Support
    	if (document.selection) {

    		// Set focus on the element
    		oField.focus();

    		// To get cursor position, get empty selection range
    		var oSel = document.selection.createRange();

    		// Move selection start to 0 position
    		oSel.moveStart('character', -oField.value.length);

    		// The caret position is selection length
    		iCaretPos = oSel.text.length;
    	}

    		// Firefox support
    	else if (oField.selectionStart || oField.selectionStart == '0')
    		iCaretPos = oField.selectionStart;

    	// Return results
    	//(new Windows.UI.Popups.MessageDialog(iCaretPos, "Title")).showAsync().done();
    	return iCaretPos;
    }
	
})();