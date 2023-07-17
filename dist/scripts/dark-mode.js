const lightCollection = document.querySelectorAll("*");
const toggle_dark_mode = document.querySelector(".toggle-dark-mode");

var dark_mode = false;

toggle_dark_mode.addEventListener("click", () => {
	toggleTheme();
});

function isThemeSelected(){
	return document.cookie.match(/theme=dark/i) != null;
}

function setTheme(dark){
	dark_mode = dark;
	if (dark_mode){
		for (const element of lightCollection){
			element.classList.add("dark-mode");
		}
		toggle_dark_mode.firstElementChild.src="/imgs/moon.svg";
		//document.cokie = "theme=dark; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie = "theme=dark; path=/";
	}else{
		for (const element of lightCollection){
			element.classList.remove("dark-mode");
		}
		toggle_dark_mode.firstElementChild.src="/imgs/sun.svg";
		//document.cokie = "theme=light; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie = "theme=light; path=/";
	}
	let allcookies = document.cookie;
	console.log(allcookies);
}

function setThemeFromCookie(){
	dark_mode = isThemeSelected();
	setTheme(dark_mode);
}

function toggleTheme(){
	setTheme(!dark_mode);
}

(function(){
	setThemeFromCookie();
})();