function hideUI() {
    const ui = document.querySelector('.ui-main.hidden')
    if (ui) {
        ui.classList.remove('hidden')
    } else {
        document.querySelector('.ui-main')?.classList.add('hidden')
    }
}

function setup() {
    window.addEventListener('keydown', event => {
        if (event.key.toLowerCase() == 'h') {
            hideUI()
        }
    })
}

setup()