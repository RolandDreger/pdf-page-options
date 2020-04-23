 //DESCRIPTION: Change PDF, AI and INDD page options 

/*
	+ Indesign Version: CS6 +
	+ Autor: Roland Dreger
	+ Datum: 9. Dezember 2013 
	
	+ Zuletzt aktualisiert: 23. April 2020
	
	Put the script in InDesign startup folder 

	+ Freies Script fuer private und kommerzielle Nutzung 
		(Creativ Commons Lizenz: Roland Dreger, CC BY 3.0 AT).
	+ Verwendung auf eigene Gefahr.
	
	+ Free Script for private and commercial use 
		(Creativ Commons Licence: Roland Dreger, CC BY 3.0 AT).
	+ Use at your own risk.
*/

//@targetengine "pageOptionsSession"


__addItemToContextMenu();

function __addItemToContextMenu() {

	const _menuItemName = { 
		en: "PDF Page Options ...", 
		de: "PDF Seitenoptionen ..." 
	};

	var _pageOptionsAction;
	var _contextMenu;
	var _objectLayerOptionsMenuItem;
	var _pageOptionsMenuItem;
	
	_pageOptionsAction = app.scriptMenuActions.item(localize(_menuItemName));
	if(!_pageOptionsAction || !_pageOptionsAction.isValid) { 
		_pageOptionsAction = app.scriptMenuActions.add(localize(_menuItemName)); 
	}
	
	_pageOptionsAction.eventListeners.add("onInvoke", __main);
	_pageOptionsAction.eventListeners.add("beforeDisplay", __checkContent);
	
	_contextMenu = app.menus.item("$ID/RtMouseLayout");
	if(!_contextMenu || !_contextMenu.isValid) {
		return false;
	}
	
	_objectLayerOptionsMenuItem = _contextMenu.menuItems.itemByName("$ID/kObjectLayerOptionsDots");
	if(!_objectLayerOptionsMenuItem || !_objectLayerOptionsMenuItem.isValid) {
		return false;
	}
	
	_pageOptionsMenuItem = _contextMenu.menuItems.itemByName(localize(_menuItemName));
	if(_pageOptionsMenuItem && _pageOptionsMenuItem.isValid) { 
		return true;
	}
	
	_contextMenu.menuItems.add(
		_pageOptionsAction,
		LocationOptions.AFTER,
		_objectLayerOptionsMenuItem
	);

	return true;
} /* END function __addItemToContextMenu */


function __checkContent(_event) {
	
	if(!_event || !(_event instanceof Event) || !_event.isValid) { return false; }
	
	var _pageOptionsAction;
	var _selection;
	
	_selection = app.properties.selection;
	_pageOptionsAction = _event.parent;
	
	if(
		(_selection != null) && (_selection.length == 1) && 
		((_selection[0].hasOwnProperty("graphics") && (_selection[0].graphics.length != 0)) && ((_selection[0].allGraphics[0] instanceof PDF)||(_selection[0].allGraphics[0] instanceof ImportedPage))) ||
		((_selection[0] instanceof PDF) || (_selection[0] instanceof ImportedPage))
	) { 
		_pageOptionsAction.enabled = true;
	} else {
		_pageOptionsAction.enabled = false;
	}
	
	return true;
} /* END function __checkContent */


function __main() {

	var _selection;
	var _frame;
	
	if(app.documents.length === 0) { return false; }
	
	_selection = app.properties.selection;
	
	if((_selection != null) && (_selection.length == 1) && _selection[0].hasOwnProperty("graphics") && (_selection[0].graphics.length != 0)) {
		 
		/* Frame selected */
		_frame = _selection[0];
		__contentSwitch(_frame);

	} else if((_selection.length == 1) && ((_selection[0] instanceof PDF)||(_selection[0] instanceof ImportedPage))) {
		
		/* PDF selected */
		_frame = _selection[0].parent;
		__contentSwitch(_frame);

	} else {
		alert ("Please select a frame with placed PDF, AI or INDD file!");
	}

	return true;
} /* END function __main */


function __contentSwitch(_frame) {
		
	if(!_frame || !(_frame.hasOwnProperty("allGraphics")) || !_frame.isValid) { return false; }
	
	var _pdf;
	var _importedPage;
	
	switch(_frame.allGraphics[0].constructor.name) {
		case "PDF":
			_pdf = _frame.pdfs[0];
			__placeFile(_pdf, _frame);
			break;
		case "ImportedPage":
			_importedPage = _frame.importedPages[0];
			__placeFile(_importedPage, _frame);
			break;
		default :
			alert("No PDF, AI or INDD file in selected frame!");
	}
	
	return true;
} /* END function __contentSwitch */


function __placeFile(_pdf, _frame) {
	
	if(!_pdf || !(_pdf.hasOwnProperty("itemLink")) || !_pdf.isValid) { return false; }
	if(!_frame || !(_frame.hasOwnProperty("place")) || !_frame.isValid) { return false; }
	
	var _filePath; 
	var _fileToPlace;
	
	try {
		_filePath = _pdf.itemLink.filePath;
		_fileToPlace = File(_filePath);
		if(!_fileToPlace || !_fileToPlace.exists) {
			alert("PDF, AI or INDD file does not exist!");
			return false;
		}
		_frame.place(_fileToPlace,true);
	} catch(_error) {
		alert(_error.message);
	}

	return true;
} /* END function __placeFile */