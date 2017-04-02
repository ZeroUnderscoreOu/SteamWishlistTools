// ==UserScript==
// @name        Steam Wishlist Tools
// @author      ZeroUnderscoreOu
// @version     1.0.0
// @icon        
// @namespace   https://github.com/ZeroUnderscoreOu/
// @match       http://steamcommunity.com/id/*/wishlist*
// @match       http://steamcommunity.com/profiles/*/wishlist*
// @grant       GM_xmlhttpRequest
// ==/UserScript==

var Tabs = document.getElementById("tabs_basebg");
var Style = document.createElement("Style");
var Div = document.createElement("Div");
var ShowDiscountsLink = document.createElement("A");
var CheckBundledLink = document.createElement("A");
var WishList = Array.from(document.querySelectorAll("H4.ellipsis")).reverse(); // reversing right away for pop() to be in straight order; kinda weird optimization

Style.textContent =	"Div.sort_options {Display:Inline-Block;}"
	+ "#wishlist_sort_options {Float:Right}";
Div.className = "sort_options";
ShowDiscountsLink.textContent = "Show discounts";
ShowDiscountsLink.addEventListener("click",ToggleDiscounts);
CheckBundledLink.textContent = "Check bundled";
CheckBundledLink.addEventListener("click",CheckBundled);

document.head.appendChild(Style);
Div.appendChild(CheckBundledLink);
Div.appendChild(document.createTextNode("\xA0\xA0")); // NbSps between links to match Steam's formatting; IDK how to insert "&nbsp;" easier
Div.appendChild(ShowDiscountsLink);
Tabs.insertBefore(Div,Tabs.firstElementChild);

function ToggleDiscounts() {
	switch (this.textContent) {
		case "Show discounts":
			this.textContent = "Show all";
			ShowDiscounts();
			break;
		case "Show all":
			this.textContent = "Show discounts";
			ShowAll();
			break;
	};
};

function ShowDiscounts() {
	Array.from(document.body.querySelectorAll("Div.wishlistRow")).forEach(function(Div){
		if (!Div.querySelector("Div.discount_block")) {
			Div.style.display = "None";
		};
	});
};

function ShowAll() {
	Array.from(document.body.querySelectorAll("Div.wishlistRow")).forEach(function(Div){
		if (Div.style.display=="none") {
			Div.style.display = "";
		};
	});
};

function CheckBundled() {
	if (WishList.length>0) {
		CheckBundledLink.textContent = "Checking (" + WishList.length + ")";
		AppName = WishList.pop();
	} else {
		CheckBundledLink.textContent = "Checked"
		return;
	};
	GM_xmlhttpRequest({
		method: "GET",
		url: "https://www.steamgifts.com/bundle-games/search?q=" + encodeURIComponent(AppName.textContent).replace(/%20/g,"+"),
		timeout: 15 * 1000,
		onload: BundleLoaded.bind(this,AppName),
		onerror: function(Data) {
			console.error("? - bundle list request error");
			AppName.textContent = "(!) " + AppName.textContent;
		},
		ontimeout: function(Data) {
			console.error("? - bundle list request timeout");
			AppName.textContent = "(!) " + AppName.textContent;
		}
	});
};

function BundleLoaded(AppName,Data) {
	var BundledHeading = /<p class="table__column__heading">(.*?)<\/p>/g;
	var BundledAppName = BundledHeading.exec(Data.responseText);
	while (BundledAppName!=null) {
		if (BundledAppName[1].replace("&amp;","&")==AppName.textContent) {
			AppName.textContent = "(B) " + AppName.textContent;
			console.log("AppName",AppName.textContent);
			break; // stopping the search
		};
		BundledAppName = BundledHeading.exec(Data.responseText);
	};
	CheckBundled();
};