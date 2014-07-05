﻿(function () {
	"use strict";
	
	var Fields = 1;
	var ContNum = 0;
	var SubNum = new Array();
	var Pressed = false;
	
	WinJS.UI.Pages.define("/pages/item/item.html", {
		// This function is called whenever a user navigates to this page. It
		// populates the page elements with the app's data.
		ready: function (element, options) {
		    //var item = Data.resolveItemReference(options.item);
		    //element.querySelector(".titlearea .pagetitle").textContent = item.title;
		
			// TODO: Initialize the page here.
			document.addEventListener('keydown', function (e){ 
			var TextField = document.activeElement;
				if (e.keyCode == WinJS.Utilities.Key.tab) {
					e.preventDefault();
				} else if (e.keyCode == WinJS.Utilities.Key.backspace && TextField.value == "" &&	TextField.id != "Input1" &&	TextField.tagName == "INPUT") {
					DeleteField();
				} else if (e.keyCode == WinJS.Utilities.Key.enter) {
					NewField();
				} else if (e.keyCode == WinJS.Utilities.Key.upArrow && TextField.id != "Input1" &&	TextField.tagName == "INPUT") {
					MoveUp();
				} else if (e.keyCode == WinJS.Utilities.Key.downArrow && TextField.id != ("Input" +		Fields) && TextField.tagName	== "INPUT") {
					MoveDown();
				} else if (e.altKey && e.keyCode == WinJS.Utilities.Key.c && TextField.tagName ==	"INPUT" && (TextField.getAttribute("data-cont") == 0 || TextField.getAttribute("data-cont") == "") && Pressed == false) {
					Pressed = true;
					CreateContention();
				} else if (e.altKey && e.keyCode == WinJS.Utilities.Key.c && TextField.tagName ==	"INPUT" && TextField.getAttribute("data-cont") != 0 && Pressed == false) {
					Pressed = true;
					DeleteContention();
				} else if (e.altKey && e.keyCode == WinJS.Utilities.Key.s && TextField.tagName == "INPUT" && TextField.getAttribute("data-sub") == 0 && Pressed == false) {
					Pressed = true;
					CreateSubpoint();
				} else if (e.altKey && e.keyCode == WinJS.Utilities.Key.s && TextField.tagName == "INPUT" && TextField.getAttribute("data-sub") != 0 && Pressed == false) {
					Pressed = true;
					DeleteSubpoint();
				}
			});
		
			document.addEventListener('keyup', function (e) {
				var itm = e.srcElement;
				var TextField = document.activeElement;
				if (e.ctrlKey && e.keyCode === WinJS.Utilities.Key.tab) {
					ChangePage();
				} else if(e.shiftKey && e.keyCode == WinJS.Utilities.Key.tab && TextField.tagName ==	"INPUT"){
					IndentOut();
				} else if (e.keyCode == WinJS.Utilities.Key.tab && doGetCaretPosition   (document.activeElement) == 0 &&	TextField.tagName == "INPUT") {
					IndentIn();
				} else if (e.altKey && (e.keyCode == WinJS.Utilities.Key.c || e.keyCode == WinJS.Utilities.Key.s)) {
					Pressed = false;
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
		input.setAttribute("data-sub", 0);


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
			PC.appendChild(input);
		} else if (Number(document.getElementById("Input" + (ElNum + 2)).getAttribute("data-cont")) != 0) {
			//If this is right before a Contention marker
			PC.insertBefore(input, document.getElementById("Cont" + (Number(document.getElementById("Input" + (ElNum + 2)).getAttribute("data-cont")))));
		} else if (Number(document.getElementById("Input" + (ElNum + 2)).getAttribute("data-sub")) != 0) {
			//If this is right before a Subpoint marker
			PC.insertBefore(input, document.getElementById((Number(document.getElementById("Input" + (ElNum + 2)).getAttribute("data-incont"))) + "Sub" + (Number(document.getElementById("Input" + (ElNum + 2)).getAttribute("data-sub")))));
		} else {
			//Else - if this is neither the newest field nor before anything significant
			PC.insertBefore(input, document.getElementById("Input" + (ElNum + 2)));
		}


		document.getElementById("Input" + (ElNum + 1)).focus();
	
		if (Number(El.getAttribute("data-cont")) != 0){
			IndentIn();
		} else if (Number(El.getAttribute("data-indent")) != 0) {
			for (var i = 0; i < El.getAttribute("data-indent") ; i++) {
				IndentIn();
			}
		}

		if (Number(El.getAttribute("data-sub")) != 0) {
			IndentIn();
		}
		
	}
	function DeleteField() {

		if (Number(document.activeElement.getAttribute("data-cont")) != 0) {
			DeleteContention();
		}


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
    	
    	//document.activeElement.style.left = "0px";
    	var Amount = 50 * CurrAtt;
    	Amount += "px";
    	if (temp != null) {
    		temp.style.left = Amount;
    		temp.style.width = "calc(99% - " + (50 * CurrAtt) + "px)";
    		temp.setAttribute("data-indent", CurrAtt);
    	} else {
			document.activeElement.style.left = Amount;
			document.activeElement.style.width = "calc(99% - " + (50 * CurrAtt) + "px)";
			document.activeElement.setAttribute("data-indent", CurrAtt);
    	}
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
    	if (CurrAtt == 0) {
    		document.activeElement.setAttribute("data-incont", 0);
    	}
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
			} else if (Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-cont") != 0)) {
				ThisCont = Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-cont"));
			} else if (Number(document.getElementById("Input" + (DetElNum() + 1)).getAttribute("data-incont")) == 0 && ContNum != 0) {
				ThisCont = 1;
			}
	
			if(ThisCont < (ContNum + 1)){
				//If this contention isn't the newest contention
				for (var i = ContNum; i >= ThisCont; i--) {
					var ContMark = document.getElementById("Cont" + i);
					ContMark.id = "Cont" + (i + 1);
					ContMark.innerText = i + 1;
					//Change the contention markers	
				}
				
				//var DOMArray = document.getElementsByTagName("INPUT");
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
		var ThisCont = Number(El.getAttribute("data-cont"));

		El.setAttribute("data-cont", 0);
		if (DetElNum() != 1 && Number(document.getElementById("Input" + (DetElNum() - 1)).getAttribute("data-incont")) != 0) {
			El.setAttribute("data-incont", Number(document.getElementById("Input" + (DetElNum() - 1)).getAttribute("data-incont")))
			IndentIn();
		}
		El.style.padding = "0";
		El.style.margin = "0";
		document.getElementById("MainContent").removeChild(document.getElementById("Cont" + ThisCont));

		if (DetElNum() < Fields) {
			//If the field you're de-cont-ing isn't the last field...
			

			if (ThisCont < ContNum) {
				//If this contention isn't the newest contention
				for (var i = (ThisCont + 1); i <= ContNum; i++) {
					var ContMark = document.getElementById("Cont" + i);
					ContMark.id = "Cont" + (i - 1);
					ContMark.innerText = Number(ContMark.innerText) - 1;
					//Change the contention markers	
				}

				//var DOMArray = document.getElementsByTagName("INPUT");
				for (var j = (DetElNum() + 1) ; j <= Fields; j++) {
					var ValueHolder = Number(document.getElementById("Input" + j).getAttribute("data-incont"));
					if (ValueHolder >= ThisCont) {
						document.getElementById("Input" + j).setAttribute("data-incont", (ValueHolder - 1));
						//Change the In Contention attributes...
					}

					ValueHolder = Number(document.getElementById("Input" + j).getAttribute("data-cont"));
					if (ValueHolder >= ThisCont) {
						document.getElementById("Input" + j).setAttribute("data-cont", (ValueHolder - 1));
						//Or for the contention headers, the Contention attribute itself
					}
				}
			}

			/*for (var i = (DetElNum() + 1) ; i <= Fields; i++) {
				var Ele = document.getElementById("Input" + i);
				if (Number(Ele.getAttribute("data-incont")) == 0 && Number(Ele.getAttribute("data-cont")) == 0) {
					Ele.setAttribute("data-incont", ThisCont);
				}
			}*/

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
		InNum.style.left = "150px";
		El.setAttribute("data-sub", ThisSub);
		El.style.padding = "5px 0";
		El.style.marginTop = "10px";
		InNum.style.marginTop = "10px";
		if (Number(El.getAttribute("data-indent")) != 1) {
			El.setAttribute("data-indent", 0);
			El.style.left = 0;
			El.style.width = "99%";
			IndentIn(El);
		}
		document.getElementById("MainContent").insertBefore(InNum, El);
		SubNum[ThisCont]++;
	}
	function DeleteSubpoint() {
		var El = document.activeElement;
		//El = Element
		if (Number(El.getAttribute("data-incont")) == 0) {
			return;
		}

		var ThisCont = Number(El.getAttribute("data-incont"));
		var ThisSub = Number(El.getAttribute("data-insub"));

		El.setAttribute("data-sub", 0);
		if (DetElNum() != 1 && Number(document.getElementById("Input" + (DetElNum() - 1)).getAttribute("data-insub")) != 0) {
			El.setAttribute("data-insub", Number(document.getElementById("Input" + (DetElNum() - 1)).getAttribute("data-insub")))
			IndentIn();
		}
		El.style.padding = "0";
		El.style.margin = "0";
		document.getElementById("MainContent").removeChild(document.getElementById("Sub" + ThisSub));

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

				for (var j = (DetElNum() + 1) ; j <= Fields; j++) {
					if (Number(document.getElementById("Input" + j).getAttribute("data-cont")) != 0) {
						break;
					}
					var ValueHolder = Number(document.getElementById("Input" + j).getAttribute("data-insub"));
					if (ValueHolder >= ThisSub) {
						document.getElementById("Input" + j).setAttribute("data-insub", (ValueHolder - 1));
						//Change the In Subpoint attributes...
					}

					ValueHolder = Number(document.getElementById("Input" + j).getAttribute("data-sub"));
					if (ValueHolder >= ThisSub) {
						document.getElementById("Input" + j).setAttribute("data-sub", (ValueHolder - 1));
						//Or for the subpoint headers, the Subpoint attribute itself
					}
				}
			}
		}
		SubNum[ThisCont]--;
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