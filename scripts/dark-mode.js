const lightCollection = document.querySelectorAll("*");
const toggleDarkMode = document.querySelector(".toggle-dark-mode");
const profilePicture = document.querySelector(".profile-picture");

let darkMode = false;

toggleDarkMode.addEventListener("click", () => {
	toggleTheme();
});

function isThemeSelected(){
	return document.cookie.match(/theme=dark/i) != null;
}

function setTheme(dark){
	darkMode = dark;
	if (darkMode){
		for (const element of lightCollection){
			element.classList.add("dark-mode");
		}
		toggleDarkMode.firstElementChild.src="/imgs/moon.svg";
		if (profilePicture) {
			profilePicture.src = "/imgs/ProfilePictureDark.svg"
		}

		//document.cokie = "theme=dark; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie = "theme=dark; path=/";
	}else{
		for (const element of lightCollection){
			element.classList.remove("dark-mode");
		}
		toggleDarkMode.firstElementChild.src="/imgs/sun.svg";
		if (profilePicture) {
			profilePicture.src = "/imgs/ProfilePicture.svg"
		}
		
		//document.cokie = "theme=light; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie = "theme=light; path=/";
	}
	let allcookies = document.cookie;
	console.log(allcookies);
}

function setThemeFromCookie(){
	darkMode = isThemeSelected();
	setTheme(darkMode);
}

function toggleTheme(){
	setTheme(!darkMode);
}

(function(){
	setThemeFromCookie();
})();