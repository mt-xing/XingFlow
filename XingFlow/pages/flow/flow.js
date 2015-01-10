// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
	"use strict";
	
	//Important DOM Variables
	var Fields = 1;
	var ContNum = 0;
	var AffContNum = 0;//The number of contentions in AFF
	var SubNum = new Array();
	var RepNum = 0;
	var SplitLoc = 1; //The number it splits after (the last AFF one)
	var CurrAff = true;
	
	//Other Useful Crap (and Constants)
	var Pressed = false;
	const IndentValue = "99%";
	const MarginTopValue = "1px";
	var IsPre = false;
	
	WinJS.UI.Pages.define("/pages/flow/flow.html", {
	    // This function is called whenever a user navigates to this page. It
	    // populates the page elements with the app's data.
        ready: function (element, options) {
        	// TODO: Initialize the page here.
        	if (options.isReal) {
        		if (!options.isPre) {
					//If this is a in-round
        			if (!options.isAff) {
        				ChangePage();
        				OpenFile(false);
        				//ChangePage();
        			} else {
        				OpenFile(true);
        				//ChangePage();
        			}
        		} else {
        			//If this is a preflow
        			if (!options.isAff) {
        				ChangePage();
        			} else {
        				ChangePage();
        				ChangePage();
        			}
        			IsPre = true;
        		}
        	}

        	document.addEventListener('keydown', function (e) {
        		var TextField = document.activeElement;
        		if (e.keyCode == WinJS.Utilities.Key.tab) {
        			e.preventDefault();
        		} else if (e.keyCode == WinJS.Utilities.Key.backspace && TextField.tagName == "INPUT" && TextField.getAttribute("data-source") == "true" && doGetCaretPosition(TextField) == 0) {
        			e.preventDefault();
        			DeleteSource();
        		} /*else if (e.keyCode == WinJS.Utilities.Key.backspace && TextField.tagName == "INPUT" && TextField.getAttribute("data-isrep") == "true" && doGetCaretPosition(TextField) == 0) {
        			e.preventDefault();
        			DeleteResponse();
        		}*/ else if (e.keyCode == WinJS.Utilities.Key.backspace && TextField.tagName == "INPUT" && doGetCaretPosition(TextField) == 0) {
        			DeleteField();
        		} else if (e.keyCode == WinJS.Utilities.Key.enter) {
        			NewField();
        		} else if (e.keyCode == WinJS.Utilities.Key.upArrow && TextField.id != "Input1" && TextField.tagName == "INPUT") {
        			MoveUp();
        		} else if (e.keyCode == WinJS.Utilities.Key.downArrow && TextField.id != ("Input" + Fields) && TextField.tagName == "INPUT") {
        			MoveDown();
        		} else if (e.altKey && e.keyCode == WinJS.Utilities.Key.c && TextField.tagName == "INPUT" && (TextField.getAttribute("data-cont") == 0 || TextField.getAttribute("data-cont") == "") && Pressed == false) {
        			Pressed = true;
        			CreateContention();
        		} else if (e.altKey && e.keyCode == WinJS.Utilities.Key.c && TextField.tagName == "INPUT" && TextField.getAttribute("data-cont") != 0 && Pressed == false) {
        			Pressed = true;
        			DeleteContention();
        		} else if (e.altKey && e.keyCode == WinJS.Utilities.Key.s && TextField.tagName == "INPUT" && TextField.getAttribute("data-sub") == 0 && Pressed == false) {
        			Pressed = true;
        			CreateSubpoint();
        		} else if (e.altKey && e.keyCode == WinJS.Utilities.Key.s && TextField.tagName == "INPUT" && TextField.getAttribute("data-sub") != 0 && Pressed == false) {
        			Pressed = true;
        			DeleteSubpoint();
        		} else if (e.keyCode == WinJS.Utilities.Key.leftArrow && TextField.getAttribute("data-isrep") == "true" && doGetCaretPosition(TextField) == 0) {
        			e.preventDefault();
        			MoveLeft();
        		} else if (e.keyCode == WinJS.Utilities.Key.rightArrow && (TextField.getAttribute("data-isrep") == "true" || Number(TextField.getAttribute("data-rep")) > 0) && doGetCaretPosition(TextField) == TextField.value.length) {
        			e.preventDefault();
        			MoveRight();
        		} else if (e.keyCode == WinJS.Utilities.Key.leftArrow && TextField.getAttribute("data-source") == "true" && doGetCaretPosition(TextField) == 0) {
        			e.preventDefault();
        			MoveSourceLeft();
        		} else if (e.keyCode == WinJS.Utilities.Key.rightArrow && TextField.getAttribute("data-issource") == "true" && doGetCaretPosition(TextField) == TextField.value.length) {
        			e.preventDefault();
        			MoveSourceRight();
        		} /*else if (e.ctrlKey && e.keyCode == WinJS.Utilities.Key.r && TextField.tagName == "INPUT") {
					Pressed = true;
					CreateResponse();
				}*/

        	});
        	document.addEventListener('keyup', function (e) {
        		var itm = e.srcElement;
        		var TextField = document.activeElement;
        		if (e.ctrlKey && e.keyCode === WinJS.Utilities.Key.tab) {
        			ChangePage();
        		} else if (e.shiftKey && e.keyCode == WinJS.Utilities.Key.tab && TextField.tagName == "INPUT") {
        			IndentOut();
        		} else if (e.altKey && (e.keyCode == WinJS.Utilities.Key.c || e.keyCode == WinJS.Utilities.Key.s)) {
        			Pressed = false;
        		} else if (e.keyCode == WinJS.Utilities.Key.tab && doGetCaretPosition(TextField) == 0 && TextField.tagName == "INPUT") {
        			IndentIn();
        		} else if (e.keyCode == WinJS.Utilities.Key.tab && doGetCaretPosition(TextField) != 0 && TextField.tagName == "INPUT") {
        			CreateSource();
        		} /*else if (e.ctrlKey && e.keyCode == WinJS.Utilities.Key.r) {
					Pressed = false;
				} */else if (e.ctrlKey && e.keyCode == WinJS.Utilities.Key.r && TextField.tagName == "INPUT") {
					//Pressed = true;
					e.preventDefault();
					CreateResponse();
				} else if (e.ctrlKey && e.keyCode == WinJS.Utilities.Key.s) {
					SaveFile();
				} else if (e.ctrlKey && e.keyCode == WinJS.Utilities.Key.o) {
					OpenFile();
				}
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

	function ChangePage() {
		if (IsPre) {
			return;
		}
    	var El = document.activeElement;
    	var TitleField = document.getElementById("AffNeg");
    	if (CurrAff) {
    		CurrAff = false;

    		if (SplitLoc == Fields) {
    			document.getElementById("Input" + Fields).focus();
    			NewField();
    			if (Number(document.activeElement.getAttribute("data-indent")) != 0) {
    				for (i = 0; i < document.activeElement.getAttribute("data-indent") ; i++) {
    					IndentOut();
    				}
    			}
    		}

    		TitleField.innerText = "Negative";
    		for (var i = 1; i <= SplitLoc; i++) {
    			document.getElementById("DivInput" + i).style.display = "none";

    			for (var j = 1; j <= Number(document.getElementById("Input" + i).getAttribute("data-rep")) ; j++) {
    				var Ele = document.getElementById("Input" + i);
    				var CurrRow = Number(Ele.id.substring(5));

    				document.getElementById(CurrRow + "ResponseContent" + j).style.display = "none";

    			}
    		}
    		for (var i = (SplitLoc + 1) ; i <= Fields; i++) {
    			document.getElementById("DivInput" + i).style.display = "block";

    			for (var j = 1; j <= Number(document.getElementById("Input" + i).getAttribute("data-rep")) ; j++) {
    				var Ele = document.getElementById("Input" + i);
    				var CurrRow = Number(Ele.id.substring(5));

    				//NewInput.id = CurrRow + "ResponseInput" + CurrCol;
    				document.getElementById(CurrRow + "ResponseContent" + j).style.display = "block";
    			}
    		}
    		document.getElementById("Input" + (SplitLoc + 1)).focus();
    	} else {
    		CurrAff = true;
    		TitleField.innerText = "Affirmative";
    		for (var i = 1; i <= SplitLoc; i++) {
    			document.getElementById("DivInput" + i).style.display = "block";

    			for (var j = 1; j <= Number(document.getElementById("Input" + i).getAttribute("data-rep")) ; j++) {
    				var Ele = document.getElementById("Input" + i);
    				var CurrRow = Number(Ele.id.substring(5));

    				document.getElementById(CurrRow + "ResponseContent" + j).style.display = "block";
    			}
    		}
    		for (var i = (SplitLoc + 1) ; i <= Fields; i++) {
    			document.getElementById("DivInput" + i).style.display = "none";
    			for (var j = 1; j <= Number(document.getElementById("Input" + i).getAttribute("data-rep")) ; j++) {
    				var Ele = document.getElementById("Input" + i);
    				var CurrRow = Number(Ele.id.substring(5));

    				document.getElementById(CurrRow + "ResponseContent" + j).style.display = "none";
    			}
    		}
    		document.getElementById("Input1").focus();
    	}
    }

    function NewField() {

    	//If we're inside a response, we'll call a separate response function and break out of this one
    	if (document.activeElement.getAttribute("data-isrep") == "true") {
    		NewResponseField();
    		return;
    	}

    	var PC = document.getElementById("MainContent");
    	//PC stands for Page Content
    	var ElNum = DetElNum();
    	//Element Number
    	var El = document.activeElement;

    	Fields++;
    	//Number of fields after operation

    	if (Fields > (ElNum + 1)) {
    		for (var i = (Fields - 1) ; i > ElNum; i--) {

    			if (Number(document.getElementById("Input" + i).getAttribute("data-rep")) > 0) {
    				for (var j = 1; j <= Number(document.getElementById("Input" + i).getAttribute("data-rep")) ; j++) {
    					document.getElementById(i + "ResponseContent" + j).style.msGridRow = (i + 1);
    					if (document.getElementById(i + "ResponseInput" + j).getAttribute("data-source") == "true") {
    						document.getElementById("Source-" + i + "ResponseContent" + j).id = "Source-" + (i + 1) + "ResponseContent" + j;
    					}

    					document.getElementById(i + "ResponseContent" + j).id = (i + 1) + "ResponseContent" + j;
    					document.getElementById(i + "ResponseInput" + j).id = (i + 1) + "ResponseInput" + j;
    				}
    			}
    			if (document.getElementById("Input" + i).getAttribute("data-source") == "true") {
    				document.getElementById("Source-Input" + i).id = "Source-Input" + (i + 1);
    			}
    			document.getElementById("Input" + i).id = "Input" + (i + 1);
    			document.getElementById("DivInput" + i).style.msGridRow = i + 1;
    			document.getElementById("DivInput" + i).id = "DivInput" + (i + 1);
    			//NewForm.id = CurrRow + "ResponseContent" + CurrCol;
    			//ResponseInput
    		}
    	}

    	var input = document.createElement("input");
    	input.type = "text";
    	input.id = "Input" + (ElNum + 1);
    	input.setAttribute("data-indent", 0);
    	input.setAttribute("data-cont", 0);
    	input.setAttribute("data-sub", 0);
    	input.setAttribute("data-source", false);
    	input.setAttribute("data-rep", 0);

    	var Holder = document.createElement("div");
    	Holder.id = "DivInput" + (ElNum + 1);
    	Holder.style.msGridRow = ElNum + 1;
    	Holder.style.msGridColumn = 1;
    	Holder.className = "HolderDiv";


    	if (Number(El.getAttribute("data-incont")) != 0) {
    		input.setAttribute("data-incont", Number(El.getAttribute("data-incont")));
    	} else if (Number(El.getAttribute("data-cont")) != 0) {
    		input.setAttribute("data-incont", Number(El.getAttribute("data-cont")));
    	} else {
    		input.setAttribute("data-incont", 0);
    	}

    	if (Number(El.getAttribute("data-insub")) != 0) {
    		input.setAttribute("data-insub", Number(El.getAttribute("data-insub")));
    	} else if (Number(El.getAttribute("data-sub")) != 0) {
    		input.setAttribute("data-insub", Number(El.getAttribute("data-sub")));
    	} else {
    		input.setAttribute("data-insub", 0);
    	}

    	if (document.getElementById("Input" + (ElNum + 2)) == null) {
    		//If this is the newest field
    		if (CurrAff && (Fields > (SplitLoc + 1))) {
    			//If this is aff and there's stuff in Neg
    			PC.insertBefore(Holder, document.getElementById("Input" + (SplitLoc + 1)));

    		} else {
    			PC.insertBefore(Holder, document.getElementById("TheGreatDivide"));

    		}

    	} else {
    		PC.insertBefore(Holder, document.getElementById("DivInput" + (ElNum + 2)));
    	}
    	document.getElementById("DivInput" + (ElNum + 1)).appendChild(input);


    	document.getElementById("Input" + (ElNum + 1)).focus();

    	if (Number(El.getAttribute("data-cont")) != 0) {
    		IndentIn();
    	} else if (Number(El.getAttribute("data-indent")) != 0) {
    		if (El.getAttribute("data-source") == "false") {
    			for (var i = 0; i < El.getAttribute("data-indent") ; i++) {
    				IndentIn();
    			}
    		} else {
    			for (var i = 2; i < El.getAttribute("data-indent") ; i++) {
    				IndentIn();
    			}
    		}
    	}

    	if (Number(El.getAttribute("data-sub")) != 0) {
    		IndentIn();
    	}

    	if (CurrAff) {
    		SplitLoc++;
    	}

    }
    function DeleteField() {

    	if (document.activeElement.getAttribute("data-isrep") == "true") {
    		DelResponseField();
    		return;
    	}

    	if (Number(document.activeElement.getAttribute("data-indent")) != 0) {
    		//var IndentNum = Number(document.activeElement.getAttribute("data-indent"));
    		if (Number(document.activeElement.getAttribute("data-incont")) == 0) {
    			//If it's not in a contention at all
    			//for (var i = 0; i < IndentNum; i++) {
    			IndentOut();
    			//}
    			return;
    		} else if (Number(document.activeElement.getAttribute("data-incont")) != 0 && Number(document.activeElement.getAttribute("data-indent")) > 1 && Number(document.activeElement.getAttribute("data-insub")) == 0) {
    			//If it's in a contention but not a subpoint
    			//for (var i = 1; i < IndentNum; i++) {
    			IndentOut();
    			//}
    			return;
    		} else if (Number(document.activeElement.getAttribute("data-incont")) != 0 && Number(document.activeElement.getAttribute("data-indent")) > 2 && Number(document.activeElement.getAttribute("data-insub")) != 0) {
    			//If it's in a subpoint
    			//for (var i = 2; i < IndentNum; i++) {
    			IndentOut();
    			//}
    			return;
    		}
    	}

    	if (document.activeElement.id == "Input1") {
    		return;
    	}

    	if (Number(document.activeElement.getAttribute("data-cont")) != 0) {
    		DeleteContention();
    	} else if (Number(document.activeElement.getAttribute("data-sub")) != 0) {
    		DeleteSubpoint();
    	} else if (document.activeElement.getAttribute("data-issource") == "true") {
    		MoveSourceRight();
    		DeleteSource();
    	}

    	var El = document.activeElement;

    	//First figure out what the current number is
    	var IDNum = DetElNum();
    	//Next, we shift focus to the field on top
    	document.getElementById("Input" + (IDNum - 1)).focus();

    	//If the field we're deleting isn't empty, we move the text
    	if (El.value != "") {
    		document.getElementById("Input" + (IDNum - 1)).value = document.getElementById("Input" + (IDNum - 1)).value + El.value;
    	}
    	//Then, we kill the field
    	El.parentNode.removeChild(El);
    	//Let's remember to kill the container too, shall we?
    	document.getElementById("Div" + El.id).parentNode.removeChild(document.getElementById("Div" + El.id));

    	//Finally, we rename all the subsequent fields so they're still consecutive
    	if (Fields != IDNum) {
    		for (var i = (IDNum + 1) ; i <= Fields; i++) {

    			document.getElementById("DivInput" + i).style.msGridRow = (i - 1);

    			if (Number(document.getElementById("Input" + i).getAttribute("data-rep")) > 0) {
    				for (var j = 1; j <= Number(document.getElementById("Input" + i).getAttribute("data-rep")) ; j++) {
    					document.getElementById(i + "ResponseContent" + j).style.msGridRow = (i - 1);
    					if (document.getElementById(i + "ResponseInput" + j).getAttribute("data-source") == "true") {
    						document.getElementById("Source-" + i + "ResponseContent" + j).id = "Source-" + (i - 1) + "ResponseContent" + j;
    					}

    					document.getElementById(i + "ResponseContent" + j).id = (i - 1) + "ResponseContent" + j;
    					document.getElementById(i + "ResponseInput" + j).id = (i - 1) + "ResponseInput" + j;
    				}
    			}

    			document.getElementById("DivInput" + i).id = "DivInput" + (i - 1);
    			document.getElementById("Input" + i).id = "Input" + (i - 1);
    		}
    	}

    	//Cleanup work
    	Fields--;
    }

    function MoveUp() {
    	if (document.activeElement.getAttribute("data-issource") == "true") {
    		MoveSourceRight();
    	}
		if (document.activeElement.getAttribute("data-isrep") == "true") {
			//If this is a response''
	
			var El = document.activeElement;
			//NewInput.id = CurrRow + "ResponseInput" + CurrCol;
			//ResponseContent for Divs
			var CurrRow = Number(El.id.split("ResponseInput")[0]);
			var CurrCol = Number(El.id.split("ResponseInput")[1]);
	
			
	
			if (El.getAttribute("data-reprow") != null) {
				//If this is one of many responses to the same point
				var CurrRepNum = Number(El.getAttribute("data-reprow"));
				if (CurrRepNum == 1) {
					document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput")).focus();
				} else {
					document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-" + (CurrRepNum - 1)).focus();
				}
				
			} else if (document.getElementById((CurrRow - 1) + "ResponseInput" + CurrCol + "-" + "1") != null) {
				//If the response on top also has many responses to the same point
				var i = 1;
				while (true) {
					if (document.getElementById((CurrRow - 1) + "ResponseInput" + CurrCol + "-" + i) != null) {
						i++;
					} else {
						document.getElementById((CurrRow - 1) + "ResponseInput" + CurrCol + "-" + (i - 1)).focus();
						break;
					}
				}
	
	
			} else if (document.getElementById((CurrRow - 1) + "ResponseInput" + CurrCol) != null) {
				//If this is the top or only response to a point
				document.getElementById((CurrRow - 1) + "ResponseInput" + CurrCol).focus();
			}
	
			return;
		}
		var ElNum = DetElNum();
		document.getElementById("Input" + (ElNum - 1)).focus();
	}
    function MoveDown() {
    	if (document.activeElement.getAttribute("data-isrep") == "true") {
    		//If this is a response

    		var El = document.activeElement;
    		//NewInput.id = CurrRow + "ResponseInput" + CurrCol;
    		//ResponseContent for Divs
    		var CurrRow = Number(El.id.split("ResponseInput")[0]);
    		var CurrCol = Number(El.id.split("ResponseInput")[1]);

			if (El.getAttribute("data-reprow") != null) {
				//If this is one of many responses to the same point
				var CurrRepNum = Number(El.getAttribute("data-reprow"));
				if (document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-" + (CurrRepNum + 1)) != null) {
					document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-" + (CurrRepNum + 1)).focus();
					return;
				} else {
					//If this is the last response of many responses
					CurrCol = Number(El.parentElement.id.split("ResponseContent")[1]);
				}
				
			} else if (document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-1") != null) {
				document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-1").focus();
				return;
			}

    		/*if(document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") +	(CurrRepNum + 1)) != null){
    			document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + (CurrRepNum + 1)).focus();
    		} else*/
			if (document.getElementById((CurrRow + 1) + "ResponseInput" + CurrCol) != null) {
    			document.getElementById((CurrRow + 1) + "ResponseInput" + CurrCol).focus();
    		} else if (document.getElementById("Input" + (CurrRow + 1)) != null) {
    			document.getElementById("Input" + (CurrRow + 1)).focus();
    		}

    		return;
    	}
    	var ElNum = DetElNum();
    	if (document.getElementById("Input" + (ElNum + 1)) != null) {
    		document.getElementById("Input" + (ElNum + 1)).focus();
    	}
    }
    function MoveSourceLeft() {
    	var El = document.activeElement;
    	document.getElementById("Source-" + El.id).focus();
    }
    function MoveSourceRight() {
    	var El = document.activeElement;
    	document.getElementById(El.id.substr(7)).focus();
    }
    function MoveLeft() {
    	if (IsPre) {
    		return;
    	}
		var El = document.activeElement;
		//NewInput.id = CurrRow + "ResponseInput" + CurrCol;
		//ResponseContent for Divs
		var CurrRow = Number(El.parentElement.id.split("ResponseContent")[0]);
		var CurrCol = Number(El.parentElement.id.split("ResponseContent")[1]);
		//var SourceEl = document.getElementById("Input" + CurrRow);
	
		if (El.getAttribute("data-reprow") != null) {
			if (document.getElementById(CurrRow + "ResponseInput" + (CurrCol - 1) + El.getAttribute("data-reprow")) != null) {
				document.getElementById(CurrRow + "ResponseInput" + (CurrCol - 1) + El.getAttribute("data-reprow")).focus();
				return;
			}
		}
		if (CurrCol > 1 && document.getElementById(CurrRow + "ResponseInput" + (CurrCol - 1)) != null) {
			//If this isn't the 1st response
			document.getElementById(CurrRow + "ResponseInput" + (CurrCol - 1)).focus();
		} else if (document.getElementById("Input" + CurrRow) != null) {
			//If this is...
			document.getElementById("Input" + CurrRow).focus();
		}
	}
    function MoveRight() {
    	if (IsPre) {
    		return;
    	}
    	var El = document.activeElement;
    	//NewInput.id = CurrRow + "ResponseInput" + CurrCol;
    	//ResponseContent for Divs

    	if (El.getAttribute("data-isrep") == "true") {
    		var CurrRow = Number(El.parentElement.id.split("ResponseContent")[0]);
    		var CurrCol = Number(El.parentElement.id.split("ResponseContent")[1]);
    	} else {
    		var CurrCol = 0;
    		var CurrRow = Number(El.id.replace("Input", ""));
    	}
    	//var SourceEl = document.getElementById("Input" + CurrRow);

    	if (El.getAttribute("data-reprow") != null) {
    		if (document.getElementById(CurrRow + "ResponseInput" + (CurrCol + 1) + El.getAttribute("data-reprow")) != null) {
    			document.getElementById(CurrRow + "ResponseInput" + (CurrCol + 1) + El.getAttribute("data-reprow")).focus();
    			return;
    		}
    	}

    	if (document.getElementById(CurrRow + "ResponseInput" + (CurrCol + 1)) != null) {
    		//If the next response exists...
    		document.getElementById(CurrRow + "ResponseInput" + (CurrCol + 1)).focus();
    	}
    }

    function IndentIn(temp) {
    	if (temp != null) {
    		CurrAtt = Number(temp.getAttribute("data-indent"));
    	} else {
    		var CurrAtt = Number(document.activeElement.getAttribute("data-indent"));
    	}

    	if (CurrAtt == NaN) {
    		CurrAtt = 0;
    	}
    	CurrAtt++;


    	//So I'm disabling the ability to indent contention headers
    	if(document.activeElement.getAttribute("data-cont") != 0){
			return;
    	}


    	//document.activeElement.style.marginLeft = "0px";
    	var Amount = 50 * CurrAtt;
    	Amount += "px";
    	if (temp != null) {
    		temp.style.marginLeft = Amount;
    		temp.style.width = "calc(" + IndentValue + " - " + (50 * CurrAtt) + "px)";
    		temp.setAttribute("data-indent", CurrAtt);
    	} else {
    		document.activeElement.style.marginLeft = Amount;
    		document.activeElement.style.width = "calc(" + IndentValue + " - " + (50 * CurrAtt) + "px)";
    		document.activeElement.setAttribute("data-indent", CurrAtt);
    	}
    }
    function IndentOut() {
    	var CurrAtt = Number(document.activeElement.getAttribute("data-indent"));
    	CurrAtt--;
    	if (CurrAtt < 0) {
    		return;
    	}
    	document.activeElement.style.marginLeft = (50 * CurrAtt) + "px";
    	document.activeElement.style.width = "calc(" + IndentValue + " - " + (50 * CurrAtt) + "px)";
    	document.activeElement.setAttribute("data-indent", CurrAtt);
    	if (CurrAtt == 0) {
    		document.activeElement.setAttribute("data-incont", 0);
    	}
    }

    function CreateContention() {
		var El = document.activeElement;
    	//El = Element

    	El.setAttribute("data-incont", 0);
    	var ThisCont = ContNum + 1;
    	if (CurrAff) {
    		AffContNum++;
    	}

    	if (DetElNum() < Fields) {
    		//If the field you're cont-ing isn't the last field...
    		if (Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-incont") != 0)) {
    			//If the next element is in another contention already,
    			//Deal with it
    			ThisCont = 1 + Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-incont"));
    		} else if (Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-cont") != 0)) {
    			ThisCont = Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-cont"));
    		} else if (Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-incont")) == 0 && ContNum != 0) {
    			ThisCont = 1;
    		}

    		if (ThisCont < (ContNum + 1)) {
    			//If this contention isn't the newest contention
    			for (var i = ContNum; i >= ThisCont; i--) {
    				var ContMark = document.getElementById("Cont" + i);
    				ContMark.id = "Cont" + (i + 1);
    				if (i < AffContNum) {

    					ContMark.innerText = i + 1;

    				} else {
    					ContMark.innerText = i - AffContNum + 1;
    				}
    				//Change the contention markers
    				SubNum[i + 1] = SubNum[i];
    			}
    		}



    		for (var i = (DetElNum() + 1) ; i <= Fields; i++) {
    			var ValueHolder = Number(document.getElementById("Input" + i).getAttribute("data-incont"));
    			if (ValueHolder >= (ThisCont - 1) && Number(document.getElementById("Input" + i).getAttribute("data-cont")) == 0) {
    				if (ValueHolder == 0 && Number(document.getElementById("Input" + i).getAttribute("data-indent")) == 0) {
    					IndentIn(document.getElementById("Input" + i));
    				}
    				document.getElementById("Input" + i).setAttribute("data-incont", (ValueHolder + 1));
    				//Change the In Contention attributes...
    			}

    			var OtherValueHolder = Number(document.getElementById("Input" + i).getAttribute("data-cont"));
    			if (OtherValueHolder >= (ThisCont - 1) && Number(document.getElementById("Input" + i).getAttribute("data-incont")) == 0) {
    				document.getElementById("Input" + i).setAttribute("data-cont", (OtherValueHolder + 1));
    				//Or for the contention headers, the Contention attribute itself
    			}


    		}

    	}

    	var InNum = document.createElement("h1");
    	InNum.id = "Cont" + ThisCont;
    	if (CurrAff) {
    		InNum.innerText = ThisCont;
    	} else {
    		InNum.innerText = ThisCont - AffContNum;
    	}
		InNum.className = "ContentionMarker";
    	El.setAttribute("data-cont", ThisCont);
    	El.style.padding = "15px 0 15px 15px";
    	El.style.marginTop = "25px";
    	if (Number(El.getAttribute("data-indent")) != 0) {
    		El.setAttribute("data-indent", 0);
    		El.style.marginLeft = 0;
    		El.style.width = IndentValue;
    	}
    	El.parentElement.insertBefore(InNum, El);
    	ContNum++;
    	
    }
    function DeleteContention() {
    	var El = document.activeElement;
    	//El = Element
    	var ThisCont = Number(El.getAttribute("data-cont"));

    	El.setAttribute("data-cont", 0);
    	if (DetElNum() != 1 && Number(document.getElementById("Input" + (DetElNum() - 1)).getAttribute("data-incont")) != 0) {
    		El.setAttribute("data-incont", Number(document.getElementById("Input" + (DetElNum() - 1)).getAttribute("data-incont")))
    		IndentIn();
    	}
    	El.style.padding = "0";
    	El.style.margin = "0";
    	document.getElementById("Cont" + ThisCont).parentElement.removeChild(document.getElementById("Cont" + ThisCont));

    	if (DetElNum() < Fields) {
    		//If the field you're de-cont-ing isn't the last field...

    		if (ThisCont < ContNum) {
    			//If this contention isn't the newest contention
    			for (var i = (ThisCont + 1) ; i <= ContNum; i++) {
    				var ContMark = document.getElementById("Cont" + i);
    				ContMark.id = "Cont" + (i - 1);
    				ContMark.innerText = Number(ContMark.innerText) - 1;
    				//Change the contention markers	
    				SubNum[i - 1] = SubNum[i];
    			}
    		}

    		for (var j = (DetElNum() + 1) ; j <= Fields; j++) {
    			var ValueHolder = Number(document.getElementById("Input" + j).getAttribute("data-incont"));
    			if (ValueHolder >= ThisCont) {
    				document.getElementById("Input" + j).setAttribute("data-incont", (ValueHolder - 1));
    				//Change the In Contention attributes...
    				if (ValueHolder == 1) {
    					//If they're no longer in a contention, de-indent them
    					document.getElementById("Input" + j).setAttribute("data-indent", 0);
    					document.getElementById("Input" + j).style.marginLeft = 0;
    					document.getElementById("Input" + j).style.width = IndentValue;
    				}
    			}

    			ValueHolder = Number(document.getElementById("Input" + j).getAttribute("data-cont"));
    			if (ValueHolder >= ThisCont) {
    				document.getElementById("Input" + j).setAttribute("data-cont", (ValueHolder - 1));
    				//Or for the contention headers, the Contention attribute itself
    			}
    		}
    	}

    	ContNum--;
    }

    function CreateSubpoint() {
    	var El = document.activeElement;
    	//El = Element

    	if (Number(El.getAttribute("data-incont")) == 0) {
    		return;
    	}

    	El.setAttribute("data-insub", 0);
    	var ThisCont = Number(El.getAttribute("data-incont"));
    	var ThisSub = SubNum[ThisCont] + 1;
    	if (isNaN(ThisSub)) {
    		ThisSub = 1;
    		SubNum[ThisCont] = 0;
    	}

    	if (DetElNum() < Fields) {
    		//If the field you're sub-ing isn't the last field...
    		if (Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-insub") != 0)) {
    			//If the next element is in another subpoint already, deal with it
    			ThisSub = 1 + Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-insub"));
    		} else if (Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-sub") != 0)) {
    			ThisSub = Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-sub"));
    		} else if (Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-insub")) == 0 && SubNum[ThisCont] != 0) {
    			ThisSub = 1;
    		}

    		if (ThisSub < (SubNum[ThisCont] + 1)) {
    			//If this subpoint isn't the newest subpoint
    			for (var i = SubNum[ThisCont]; i >= ThisSub; i--) {
    				var ContMark = document.getElementById(ThisCont + "Sub" + i);
    				ContMark.id = ThisCont + "Sub" + Number(i + 1);
    				ContMark.innerText = Number(ContMark.innerText) + 1;
    				//Change the subpoint markers	
    			}
    		}


    		for (var i = (DetElNum() + 1) ; i <= Fields; i++) {
    			if (Number(document.getElementById("Input" + i).getAttribute("data-cont")) != 0) {
    				break;
    			}
    			var ValueHolder = Number(document.getElementById("Input" + i).getAttribute("data-insub"));
    			if (ValueHolder >= (ThisSub - 1) && Number(document.getElementById("Input" + i).getAttribute("data-sub")) == 0) {
    				if (ValueHolder == 0 && Number(document.getElementById("Input" + i).getAttribute("data-indent")) == 1) {
    					IndentIn(document.getElementById("Input" + i));
    				}
    				document.getElementById("Input" + i).setAttribute("data-insub", (ValueHolder + 1));
    				//Change the In Subpoint attributes...
    			}

    			var OtherValueHolder = Number(document.getElementById("Input" + i).getAttribute("data-sub"));
    			if (OtherValueHolder >= (ThisSub - 1) && Number(document.getElementById("Input" + i).getAttribute("data-insub")) == 0) {
    				document.getElementById("Input" + i).setAttribute("data-sub", (OtherValueHolder + 1));
    				//Or for the subpoint headers, the subpoint attribute itself
    			}
    		}

    	}

    	var InNum = document.createElement("h2");
    	InNum.id = ThisCont + "Sub" + ThisSub;
    	//InNum.innerHTML = "<h1>" + ContNum + "</h1>";
    	InNum.innerText = ThisSub;
    	InNum.style.position = "absolute";
    	InNum.style.marginLeft = "30px";
    	El.setAttribute("data-sub", ThisSub);
    	El.style.padding = "5px 0";
    	El.style.marginTop = "10px";
    	InNum.style.marginTop = "10px";
    	if (Number(El.getAttribute("data-indent")) != 1) {
    		El.setAttribute("data-indent", 0);
    		El.style.marginLeft = 0;
    		El.style.width = IndentValue;
    		IndentIn(El);
    	}
    	El.parentElement.insertBefore(InNum, El);
    	SubNum[ThisCont]++;
    }
    function DeleteSubpoint() {
    	var El = document.activeElement;
    	//El = Element
    	if (Number(El.getAttribute("data-incont")) == 0) {
    		return;
    	}

    	var ThisCont = Number(El.getAttribute("data-incont"));
    	var ThisSub = Number(El.getAttribute("data-sub"));

    	El.setAttribute("data-sub", 0);
    	if (DetElNum() != 1 && Number(document.getElementById("Input" + (DetElNum() - 1)).getAttribute("data-insub")) != 0) {
    		El.setAttribute("data-insub", Number(document.getElementById("Input" + (DetElNum() - 1)).getAttribute("data-insub")))
    		IndentIn();
    	}
    	El.style.padding = "0";
    	El.style.margin = "0";
    	document.getElementById(ThisCont + "Sub" + ThisSub).parentElement.removeChild(document.getElementById(ThisCont + "Sub" + ThisSub));

    	if (DetElNum() < Fields) {
    		//If the field you're de-sub-ing isn't the last field...
    		if (ThisSub < SubNum[ThisCont]) {
    			//If this subpoint isn't the newest subpoint
    			for (var i = (ThisSub + 1) ; i <= SubNum[ThisCont]; i++) {
    				var ContMark = document.getElementById(ThisCont + "Sub" + i);
    				ContMark.id = ThisCont + "Sub" + Number(i - 1);
    				ContMark.innerText = Number(ContMark.innerText) - 1;
    				//Change the subpoint markers
    			}
    		}

    		for (var j = (DetElNum() + 1) ; j <= Fields; j++) {
    			if (Number(document.getElementById("Input" + j).getAttribute("data-cont")) != 0) {
    				break;
    			}
    			var ValueHolder = Number(document.getElementById("Input" + j).getAttribute("data-insub"));
    			if (ValueHolder >= ThisSub) {
    				document.getElementById("Input" + j).setAttribute("data-insub", (ValueHolder - 1));
    				//Change the In Subpoint attributes...
    				if (ValueHolder == 1) {
    					//If they're no longer in a subpoint, de-indent them
    					document.getElementById("Input" + j).setAttribute("data-indent", 0);
    					document.getElementById("Input" + j).style.marginLeft = 0;
    					document.getElementById("Input" + j).style.width = IndentValue;
    					IndentIn(document.getElementById("Input" + j));
    				}
    			}

    			ValueHolder = Number(document.getElementById("Input" + j).getAttribute("data-sub"));
    			if (ValueHolder >= ThisSub) {
    				document.getElementById("Input" + j).setAttribute("data-sub", (ValueHolder - 1));
    				//Or for the subpoint headers, the Subpoint attribute itself
    			}
    		}

    	}
    	SubNum[ThisCont]--;
    }

    function CreateSource() {
    	var El = document.activeElement;

    	if (El.tagName != "INPUT" || Number(El.getAttribute("data-cont")) != 0 || Number(El.getAttribute("data-sub")) != 0 || El.getAttribute("data-source") == "true") {
    		return;
    	}

    	var style = window.getComputedStyle(El),
			MarLeft = style.getPropertyValue('margin-left'),
			FormInfo = MarginTopValue + " 0 0 " + MarLeft;

    	IndentIn(El);
    	IndentIn(El);

    	var NewForm = document.createElement("input");
    	NewForm.type = "text";
    	NewForm.id = "Source-" + El.id;
    	NewForm.value = El.value;
    	NewForm.style.position = "absolute";
    	NewForm.style.width = "90px";
    	NewForm.style.margin = FormInfo;
    	NewForm.setAttribute("data-issource", true);

    	El.setAttribute("data-source", true);
    	El.value = "";
    	El.parentElement.insertBefore(NewForm, El);
    }
    function DeleteSource() {
    	var El = document.activeElement;
    	El.value = document.getElementById("Source-" + El.id).value + El.value;
    	IndentOut();
    	IndentOut();
    	document.activeElement.parentNode.removeChild(document.getElementById("Source-" + El.id));
    	El.setAttribute("data-source", false);
    }

    function CreateResponse() {
    	if (IsPre) {
    		return;
    	}
    	var El = document.activeElement;
    	if (El.getAttribute("data-isrep") == "true" && El.getAttribute("data-hasreprow") != "true" && El.getAttribute("data-reprow") == null) {
    		var StringTemp = El.id.split("ResponseInput");
    		var CurrCol = Number(StringTemp[1]);
    		var CurrRow = Number(StringTemp[0]);
    	} else if (El.getAttribute("data-isrep") == "true") {
    		var StringTemp = El.id.split("ResponseInput");
    		var CurrRow = Number(StringTemp[0]);
    		if (El.getAttribute("data-reprow") == null) {
    			var CurrCol = Number(StringTemp[1]);
    		} else {
    			var CurrCol = El.parentElement.id.split("ResponseContent")[1];
    		}
    	} else{
    		var CurrCol = 0;
    		var CurrRow = Number(El.id.replace("Input", ""));
    	}

    	var SourceEl = document.getElementById("Input" + CurrRow);

    	if (CurrCol == RepNum) {
    		//If this is a new response column
    		RepNum++;
    		var StyleHolder = "40vw";
    		for (var i = 0; i < RepNum; i++) {
    			StyleHolder += " 30vw";
    		}
    		document.getElementById("MainContent").style.msGridColumns = StyleHolder;
    	} else if (Number(SourceEl.getAttribute("data-rep")) > CurrCol) {
    		MoveRight();
    		return;
    	}
    	CurrCol++;
    	//Insert a new div
    	var NewForm = document.createElement("div");
    	NewForm.id = CurrRow + "ResponseContent" + CurrCol;
    	NewForm.style.position = "relative";
    	NewForm.style.msGridColumn = (CurrCol + 1);
    	NewForm.style.msGridRow = CurrRow;
    	NewForm.style.width = "100%";
    	NewForm.style.margin = MarginTopValue + "5px 0 1px";
    	document.getElementById("MainContent").appendChild(NewForm);

    	var NewInput = document.createElement("input");
    	NewInput.type = "text";
    	NewInput.id = CurrRow + "ResponseInput" + CurrCol;
    	NewInput.setAttribute("data-isrep", "true")
    	document.getElementById(CurrRow + "ResponseContent" + CurrCol).appendChild(NewInput);

    	if (Number(SourceEl.getAttribute("data-rep")) < CurrCol) {
    		SourceEl.setAttribute("data-rep", CurrCol);
    	}


    	document.getElementById(CurrRow + "ResponseInput" + CurrCol).focus();
    }
    function DeleteResponse() {
    	if (IsPre) {
    		return;
    	}
    	var El = document.activeElement;
    	var CurrRow = Number(El.id.split("ResponseInput")[0]);
    	var CurrCol = Number(El.id.split("ResponseInput")[1]);
    	var SourceEl = document.getElementById("Input" + CurrRow);

    	if (Number(SourceEl.getAttribute("data-rep")) > CurrCol) {
    		//If this isn't the last column
    		El.parentElement.removeChild(El);
    		// TODO: Extension arrow should be added here
    	} else {
    		//If this is the last column
    		El.parentElement.removeChild(El);
    		SourceEl.setAttribute("data-rep", (CurrCol - 1));
    	}
    }

    function NewResponseField() {
    	if (IsPre) {
    		return;
    	}
		//Multiple responses to the same point earlier in the flow
		var CurrEl = document.activeElement;
		var MainContainer = CurrEl.parentElement;
		var CurrRepNum = 0;
		if (CurrEl.getAttribute("data-reprow") == null) {
			CurrRepNum = 1;
			CurrEl.setAttribute("data-hasreprow", true);
		} else {
			CurrRepNum = Number(CurrEl.getAttribute("data-reprow")) + 1;
		}
		
		var i;

		if (document.getElementById(MainContainer.id.replace("ResponseContent", "ResponseInput") + "-" + CurrRepNum) != null) {
			//If this isn't the newest response
			
			i = CurrRepNum;
			while (document.getElementById(MainContainer.id.replace("ResponseContent", "ResponseInput") + "-" + i) != null) {
				//We need to loop down from the highest number, so we use a while loop to figure out what that number is
				i++;
			}
			i--;
			for (var j = i; j >= CurrRepNum; j--) {
				//We then use a for loop to loop through existing fields and update their ids
				document.getElementById(MainContainer.id.replace("ResponseContent", "ResponseInput") + "-" + j).setAttribute("data-reprow", (j + 1));
				document.getElementById(MainContainer.id.replace("ResponseContent", "ResponseInput") + "-" + j).id = MainContainer.id.replace("ResponseContent", "ResponseInput") + "-" + (j + 1);
			}

		}
	
		var NewInput = document.createElement("input");
		NewInput.type = "text";
		NewInput.id = MainContainer.id.replace("ResponseContent", "ResponseInput") + "-" + CurrRepNum;//CurrRow +		"ResponseInput" + CurrCol;
		NewInput.setAttribute("data-isrep", "true");
		NewInput.setAttribute("data-reprow", CurrRepNum); //Response Row = Reprow
		if (i == null) {
			MainContainer.appendChild(NewInput);
		} else {
			MainContainer.insertBefore(NewInput, document.getElementById(MainContainer.id.replace("ResponseContent", "ResponseInput") + "-" + (CurrRepNum + 1)));
		}
		NewInput.focus();
    }
    function DelResponseField() {
    	if (IsPre) {
    		return;
    	}
    	var El = document.activeElement;
    	if (El.getAttribute("data-reprow") == null && El.getAttribute("data-hasreprow") != "true") {
			//If this is the only response to a field
    		DeleteResponse();
    		return;
    	}
    	//If this isn't the only response to a field
    	var CurrElNum = Number(El.getAttribute("data-reprow"));
    	if (CurrElNum == null) {
    		CurrElNum = 0;
    	}

    	

    	var i = CurrElNum + 1;
    	while (document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-" + i) != null) {
    		if (i == 1) {
    			document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-" + i).setAttribute("data-reprow", null);
    			document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-" + i).setAttribute("data-hasreprow", true);
    			document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-" + i).id = El.parentElement.id.replace("ResponseContent", "ResponseInput");
    		} else {
    			document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-" + i).setAttribute("data-reprow", (i - 1));
    			document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-" + i).id = El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-" + (i - 1);
    		}
    		
    		i++;
    	}


    	
    	if (CurrElNum == 1) {
    		document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput")).focus();
    	} else {
    		document.getElementById(El.parentElement.id.replace("ResponseContent", "ResponseInput") + "-" + (CurrElNum - 1)).focus();
    	}


    	El.parentNode.removeChild(El);
    	
    }
	
	//====================
	//Working w/ Files
	//====================
	
    function SaveFile() {
    	
    	var currentState = Windows.UI.ViewManagement.ApplicationView.value;
    	if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
			!Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
    		// Fail silently if we can't unsnap
    		return;
    	}
    	//=================
    	//THIS IS WHERE THE SHTUFF ACTUALLY HAPPENS
    	//=================

    	var SavingContent = Fields + "\n" + ContNum + "\n" + RepNum + "\n" + SubNum + "\n" + SplitLoc + "\n" + AffContNum + "\n";
    	SavingContent += document.getElementById("MainContent").innerHTML.replace(/(\r\n|\n|\r)/gm, "") + "\n";

    	//var NumRep = 0;

    	for (var i = 1; i <= Fields; i++) {
    		SavingContent += document.getElementById("Input" + i).value + "\n";
    		//We can add a variable that tracks the number of responses and then loop through that to get the stuff in the respones dialogs

    		if (document.getElementById("Input" + i).getAttribute("data-source") == "true") {
    			SavingContent += document.getElementById("Source-Input" + i).value + "\n";
    		}

    		for (var j = 1; j <= Number(document.getElementById("Input" + i).getAttribute("data-rep")) ; j++) {
    			var El = document.getElementById("Input" + i);
    			var CurrRow = Number(El.id.substring(5));

    			SavingContent += document.getElementById(CurrRow + "ResponseInput" + j).value + "\n";

    			if (document.getElementById(CurrRow + "ResponseInput" + j).getAttribute("data-source") == "true") {
    				SavingContent += document.getElementById("Source-" + CurrRow + "ResponseInput" + j).value + "\n";
    			}
    			if (document.getElementById(CurrRow + "ResponseInput" + j).getAttribute("data-reprow") == "true") {
    				var h = 1;
    				while (document.getElementById(CurrRow + "ResponseInput" + j + "-" + h) != null) {
    					SavingContent += document.getElementById(CurrRow + "ResponseInput" + j + "-" + h).value + "\n";
    					h++;
    				}
    			}
    		}

    	}

    	if (IsPre) {
    		//TODO: Save all the stuff and then return
    		var localSettings = Windows.Storage.ApplicationData.current.localSettings;
    		var localFolder = Windows.Storage.ApplicationData.current.localFolder;

    		if (CurrAff) {
    			localFolder.createFileAsync("AffPre.xflow", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (sampleFile) {
    				//var formatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("longtime");
    				//var timestamp = formatter.format(new Date());

    				return Windows.Storage.FileIO.writeTextAsync(sampleFile, SavingContent);
    			}).done(function () {
    				//Finished saving settings
    			});
    		} else {
    			localFolder.createFileAsync("NegPre.xflow", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (sampleFile) {
    				//var formatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("longtime");
    				//var timestamp = formatter.format(new Date());

    				return Windows.Storage.FileIO.writeTextAsync(sampleFile, SavingContent);
    			}).done(function () {
    				//Finished saving settings
    			});
    		}
    			


    		return;
    	}

    	// Create the picker object and set options
    	var savePicker = new Windows.Storage.Pickers.FileSavePicker();
    	savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.desktop;
    	// Dropdown of file types the user can save the file as
    	savePicker.fileTypeChoices.insert("Xing Flow", [".xflow"]);
    	// Default file name if the user does not type one in or select a file to replace
    	savePicker.suggestedFileName = "Epic Flow";


    	savePicker.pickSaveFileAsync().then(function (file) {
    		if (file) {
    			// Prevent updates to the remote version of the file until we finish making changes and call CompleteUpdatesAsync.
    			Windows.Storage.CachedFileManager.deferUpdates(file);
    			// write to file
    			Windows.Storage.FileIO.writeTextAsync(file, SavingContent).done(function () {
    				// Let Windows know that we're finished changing the file so the other app can update the remote version of the file.
    				// Completing updates may require Windows to ask for user input.
    				Windows.Storage.CachedFileManager.completeUpdatesAsync(file).done(function (updateStatus) {
    					if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
    						WinJS.log && WinJS.log("File " + file.name + " was saved.", "sample", "status");
    					} else {
    						WinJS.log && WinJS.log("File " + file.name + " couldn't be saved.", "sample", "status");
    					}
    				});
    			});
    		} else {
    			WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
    		}
    	});

    }
    function OpenFile(IsRoundTemp) {
    	if (IsPre) {
    		return;
    	}
    	var SavingContent = "";


    	if (IsRoundTemp != null) {
    		
    		//var SplitContent = "";
    		if (IsRoundTemp) {
    			openPreFlow("AffPre.xflow");
    		} else {
    			openPreFlow("NegPre.xflow");
    		}
    		

    		return;

    	}

    	// Verify that we are currently not snapped, or that we can unsnap to open the picker
    	var currentState = Windows.UI.ViewManagement.ApplicationView.value;
    	if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
			!Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
    		// Fail silently if we can't unsnap
    		return;
    	}

    	// Create the picker object and set options
    	var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
    	openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.list;
    	openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.desktop;
    	// Users expect to have a filtered view of their folders depending on the scenario.
    	// For example, when choosing a documents folder, restrict the filetypes to documents for your application.
    	openPicker.fileTypeFilter.replaceAll([".xflow"]);

    	// Open the picker for the user to pick a file
    	openPicker.pickSingleFileAsync().then(function (file) {
    		if (file) {
    			// Application now has read/write access to the picked file
    			//WinJS.log && WinJS.log("Picked photo: " + file.name, "sample", "status");
    			Windows.Storage.FileIO.readTextAsync(file).then(function (contents) {
    				// Add code to process the text read from the file

    				//=================
    				//THIS IS WHERE THE SHTUFF ACTUALLY HAPPENS
    				//=================

    				var SplitContent = contents.split("\n");

    				//(new Windows.UI.Popups.MessageDialog("Debug Contents:\n" + SplitContent, "Title")).showAsync().done();
    				Fields = SplitContent[0];
    				ContNum = SplitContent[1];
    				RepNum = SplitContent[2];
    				SubNum = SplitContent[3].split(",");
    				SplitLoc = SplitContent[4];
    				AffContNum = SplitContent[5];
    				document.getElementById("MainContent").innerHTML = SplitContent[6];

    				var k = 7;
    				//SplitContent Iterator

    				for (var i = 1; i <= (Fields) ; i++) {
    					document.getElementById("Input" + i).value = SplitContent[k];

    					if (document.getElementById("Input" + i).getAttribute("data-source") == "true") {
    						k++;
    						document.getElementById("Source-Input" + i).value = SplitContent[k];
    					}
    					k++;

    					for (var j = 1; j <= Number(document.getElementById("Input" + i).getAttribute("data-rep")) ; j++) {
    						var El = document.getElementById("Input" + i);
    						var CurrRow = Number(El.id.substring(5));

    						//NewInput.id = CurrRow + "ResponseInput" + CurrCol;
    						document.getElementById(CurrRow + "ResponseInput" + j).value = SplitContent[k];
    						k++;

    						if (document.getElementById(CurrRow + "ResponseInput" + j).getAttribute("data-source") == "true") {
    							document.getElementById("Source-" + CurrRow + "ResponseInput" + j).value = SplitContent[j];
    							//document.getElementById("Source-Input" + i).value = SplitContent[k];
    							j++;
    						}
    						if (document.getElementById(CurrRow + "ResponseInput" + j).getAttribute("data-reprow") == "true") {
    							var h = 1;
    							while (document.getElementById(CurrRow + "ResponseInput" + j + "-" + h) != null) {
    								//SavingContent += document.getElementById(CurrRow + "ResponseInput" + j + "-" + h).value + "\n";
    								document.getElementById(CurrRow + "ResponseInput" + j + "-" + h).value = SplitContent[j];
    								h++;
    							}
    						}
    					}
    				}

    				var StyleHolder = "40vw";
    				for (var i = 0; i < RepNum; i++) {
    					StyleHolder += " 30vw";
    				}
    				document.getElementById("MainContent").style.msGridColumns = StyleHolder;

    			});
    		} else {
    			// The picker was dismissed with no selected file
    			WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
    		}
    	});




    	//THIS IS WHAT IS BEING READ FROM FILE
    	//var SavingContent = "";
    	/*if (SavingContent == null) {
			//(new Windows.UI.Popups.MessageDialog("Nope", "Title")).showAsync().done();
			document.getElementById("MainContent").innerHTML += "<h1>NOPE</h1>";
			return;
		}*/
    	//This is the variable




    }

	//====================
	//Misc. Functions
	//====================

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
	
	// Returns the caret (cursor) position of the specified text field.
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

	//Opens a specified file from AppData
	function openPreFlow(fname) {

		var SplitContent = "";

		var localFolder = Windows.Storage.ApplicationData.current.localFolder;
		localFolder.getFileAsync(fname)
		   .then(function (sampleFile) {
		   	return Windows.Storage.FileIO.readTextAsync(sampleFile);
		   	//console.log(SplitContent);
		   }).done(function (SplitContent) {
		   	// Data is contained in timestamp
		   	SplitContent = SplitContent.split("\n");

		   	/*
			ALL OF THE FOLLOWING IS A COPY AND PASTE FROM ABOVE

			*/


		   	Fields = Number(SplitContent[0]);
		   	ContNum = Number(SplitContent[1]);
		   	RepNum = Number(SplitContent[2]);
		   	SubNum = SplitContent[3].split(",");
		   	SplitLoc = Number(SplitContent[4]);
		   	AffContNum = SplitContent[5];
		   	document.getElementById("MainContent").innerHTML = SplitContent[6];

		   	var k = 7;
		   	//SplitContent Iterator

		   	for (var i = 1; i <= (Fields) ; i++) {
		   		document.getElementById("Input" + i).value = SplitContent[k];

		   		if (document.getElementById("Input" + i).getAttribute("data-source") == "true") {
		   			k++;
		   			document.getElementById("Source-Input" + i).value = SplitContent[k];
		   		}
		   		k++;

		   		for (var j = 1; j <= Number(document.getElementById("Input" + i).getAttribute("data-rep")) ; j++) {
		   			var El = document.getElementById("Input" + i);
		   			var CurrRow = Number(El.id.substring(5));

		   			document.getElementById(CurrRow + "ResponseInput" + j).value = SplitContent[k];
		   			k++;

		   			if (document.getElementById(CurrRow + "ResponseInput" + j).getAttribute("data-source") == "true") {
		   				document.getElementById("Source-" + CurrRow + "ResponseInput" + j).value = SplitContent[j];
		   				//document.getElementById("Source-Input" + i).value = SplitContent[k];
		   				j++;
		   			}
		   		}
		   	}

		   	var StyleHolder = "40vw";
		   	for (var i = 0; i < RepNum; i++) {
		   		StyleHolder += " 30vw";
		   	}
		   	document.getElementById("MainContent").style.msGridColumns = StyleHolder;
		   }, function () {
		   	// Timestamp not found
		   });
	}
		
})();
