const lightCollection = document.querySelectorAll("body, header, main, footer, a, td, .toggle-dark-mode");
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
		toggle_dark_mode.firstElementChild.className="far fa-moon";
		document.cookie = "theme=dark";
	}else{
		for (const element of lightCollection){
			element.classList.remove("dark-mode");
		}
		toggle_dark_mode.firstElementChild.className="far fa-sun";
		document.cookie = "theme=light";
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