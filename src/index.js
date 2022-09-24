import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import Helper from './js/helper'
import { Config } from './js/config'
import AppIcon from './img/logo.svg'


document.querySelector('.generate').addEventListener("click", e => {
    Helper.renderNumbers()
})

document.querySelector('.clear-games').addEventListener("click", e => {
    document.querySelector(".numbers").innerHTML = ""
    document.querySelector(".save").style.display = "none"
    document.querySelector(".number-games").value = ""
    document.querySelector(".clear-games").style.display = "none"
    document.querySelector(".generate").style.display = "none"
})

document.querySelector('.save a').addEventListener("click", e => {
    Helper.saveData()
})

document.querySelector('.clear-import a').addEventListener("click", e => {
    document.querySelector(".import-filename").style.display = "none"
    document.querySelector(".data-filename").style.display = ''
    document.querySelector("#importJson").value = ''
    document.querySelector(".clear-import").closest("li").style.display = "none"
    document.querySelector(".load-data").closest("li").style.display = "none"
})

document.querySelector('.load-data a').addEventListener("click", e => {
    Helper.importData()
})


Helper.addGlobalEventListener('change', '.number-games', e => {
    if (e.target.value && parseInt(e.target.value) > 0) {
        document.querySelector(".clear-games").style.display = "inline-block"
        document.querySelector(".generate").style.display = "inline-block"
    }
    else {
        document.querySelector(".clear-games").style.display = "none"
        document.querySelector(".generate").style.display = "none"
    }
})

Helper.addGlobalEventListener('change', '#importJson', e => {
    if (e.target.files.length > 0) {

        const file = e.target.files[0].name,
            ext = file.split('.')[1].toLowerCase()

        if (ext !== 'json') {
            alert('Invalid input file.')
            return
        }
        
        document.querySelector(".import-filename").style.display = "block"
        document.querySelector(".data-filename").innerHTML = file
        document.querySelector(".clear-import").closest("li").style.display = "block"
        document.querySelector(".load-data").closest("li").style.display = "block"
    }
    else {
        document.querySelector(".import-filename").style.display = "none"
        document.querySelector(".clear-import").closest("li").style.display = "none"
        document.querySelector(".load-data").closest("li").style.display = "none"
    }
})

Helper.addGlobalEventListener('change', '.pb-select', e => {
    const game = e.target.getAttribute("data-game"),
        value = e.target.value
    Config.exportObject[`game${game}`].powerball = value

})

Helper.addGlobalEventListener('click', '.refine-button i', e => {
    Helper.refineNumbers(e)
})

Helper.addGlobalEventListener('click', '.pb-toggle i', e => {

    if (Config.isPowerballEditable) {
        Config.isPowerballEditable = false
    }
    else {
        Config.isPowerballEditable = true
    }
    if (Config.isPowerballEditable) {
        Config.exportObject.isPowerballEditable = true
        Helper.formatPBElement()
        e.target.style.color = '#000'
    }
    else {
        Config.exportObject.isPowerballEditable = false
        Helper.formatPBElement()
        e.target.style.color = '#ccc'
    }
})

document.querySelector('.page-title img').setAttribute("src", AppIcon)

const startup = async () => {
    await SplashScreen.show({
        showDuration: 3000,
        autoHide: true,
    })
    //StatusBar.setOverlaysWebView({ overlay: true });
}

// const setStatusBarStyleDark = async () => {
//     await StatusBar.setStyle({ style: Style.Dark });
// };

const setStatusBarToBlack = async () => {
    await StatusBar.setBackgroundColor({ color: '#000000' });
};

document.body.onload = () => {
    document.body.removeAttribute('style')
    if (Capacitor.isNativePlatform()) {
        //startup()
        setStatusBarToBlack()
    }


}