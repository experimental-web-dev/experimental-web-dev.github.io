function hideUI() {
    const ui = document.querySelector('.ui-main.hidden')
    if (ui) {
        ui.classList.remove('hidden')
    } else {
        document.querySelector('.ui-main')?.classList.add('hidden')
    }
}

function updateRangeValue(inputElement:HTMLInputElement) {
    const value = inputElement.value
    const nextSibling = (inputElement.nextElementSibling as HTMLElement)
    if (parseFloat(inputElement.step) >= 1) {
        nextSibling.textContent = parseFloat(value).toFixed(0)
    } else {
        nextSibling.textContent = parseFloat(value).toFixed(1)
    }
}

function setup() {
    window.addEventListener('keydown', event => {
        if (event.key.toLowerCase() == 'h') {
            hideUI()
        }
    })

    let inputRangeList = document.querySelectorAll('input[type="range"]')
    inputRangeList.forEach(element => {
        element.addEventListener('input', event => {
            updateRangeValue(event.target as HTMLInputElement)
        })
        updateRangeValue(element as HTMLInputElement)
    });

    let inputList = document.querySelectorAll('input')
    inputList.forEach(element => {
        element.addEventListener('mousemove', event => {
            event.stopPropagation()
        })
    });

    document.querySelectorAll('select').forEach(element => {
        element.addEventListener('mousemove', event => {
            event.stopPropagation()
        })
    })
}

setup()