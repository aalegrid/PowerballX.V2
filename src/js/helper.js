import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import FileSaver from "file-saver"
import { Config } from './config'

export default class Helper {
    constructor() {
    }

    static addGlobalEventListener = (type, selector, callback) => {
        document.addEventListener(type, e => {
            if (e.target.matches(selector)) callback(e)
        })
    }

    static randomiseWithinRange = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    static buildPBDropdown = (i, PB) => {
        if (!Config.isPowerballEditable) {
            const span = document.createElement("span")
            span.innerHTML = PB
            return span
        }
        const selectElement = document.createElement("select")
        selectElement.setAttribute("data-game", i)
        selectElement.setAttribute("class", "powerball-select")
        for (let k = Config.powerball.min; k <= Config.powerball.max; k++) {
            const option = document.createElement("option")
            option.value = k
            option.innerHTML = k
            if (k == PB) {
                option.setAttribute("selected", "")
            }
            selectElement.append(option)
        }
        return selectElement
    }

    static buildRefineInput = (i) => {
        const tdRefine = document.createElement("span")
        tdRefine.setAttribute("id", `game_${i}_refine`)
        tdRefine.setAttribute("class", "refine")
        tdRefine.setAttribute("data-game", i)
        tdRefine.innerHTML = `<input type="search" id="refine_text_${i}" ><a type="button" data-game="${i}" class="refine-button"><i class="fal fa-sync"></i></button>`
        return tdRefine
    }

    static renderNumbers = (json) => {

        const data = json,
            gameCount = data ? parseInt(data.games) : document.querySelector(".game-count").value,
            numbersDiv = document.querySelector(".numbers")

        if (!data) {
            if (!gameCount) {
                alert(`Please input number of games to be renderd.`)
                return;
            }
            if (gameCount < 0 || gameCount > 100) {
                alert(`Valid number of games is from 1 to 100.`)
                return;
            }
        }


        if (data) {
            document.querySelector(".game-count").value = gameCount
            if (data.isPowerballEditable) {
                Config.isPowerballEditable = true
                Config.exportObject.isPowerballEditable = true
            }
            else {
                Config.isPowerballEditable = false
                Config.exportObject.isPowerballEditable = false
            }
        }

        if (gameCount > 0) {

            const d = new Date(),
            stamp = d.toISOString(),
            powerballArray = [],
            numbersHeader = document.createElement("div")

            document.querySelector(".save").style.display = "block"
            numbersDiv.innerHTML = ""
            Config.exportObject.title = "Powerball Game Generator"
            Config.exportObject.dateStamp = stamp
            Config.exportObject.games = gameCount

            numbersHeader.setAttribute('class', 'header')
            numbersHeader.innerHTML = `<span>1</span> <span>2</span> <span>3</span> <span>4</span> <span>5</span> <span>6</span> <span>7</span> <span><a class="powerball-toggle"><i class="fal fa-pencil" style="color:#ccc"></i></a></span> <span class="refine">Refine</span>`
            numbersDiv.appendChild(numbersHeader)

            for (let i = 1; i <= gameCount; i++) {

                const game = data ? data[`game${i}`] : null,
                numArray = []

                for (let j = 1; j <= 7; j++) {
                    let randomNum = data ? game.numbers[j - 1] : Helper.randomiseWithinRange(Config.number.min, Config.number.max)
                    if (!data) {
                        while (numArray.includes(randomNum)) {
                            randomNum = Helper.randomiseWithinRange(Config.number.min, Config.number.max)
                        }
                    }

                    numArray.push(randomNum)
                }

                numArray.sort(function (a, b) {
                    return a - b;
                })

                Config.exportObject[`game${i}`] = {}
                Config.exportObject[`game${i}`].numbers = []
                Config.exportObject[`game${i}`].numbers = numArray

                let PB = data ? game.powerball : Helper.randomiseWithinRange(Config.powerball.min, Config.powerball.max)

                if (!data && i <= 15) {
                    while (powerballArray.includes(PB)) {
                        PB = Helper.randomiseWithinRange(Config.powerball.min, Config.powerball.max)
                    }
                }

                powerballArray.push(PB)

            }

            powerballArray.sort(function (a, b) {
                return a - b;
            })

            for (let i = 1; i <= gameCount; i++) {

                const gameDiv = document.createElement("div")
                gameDiv.setAttribute("id", `game_${i}`)
                gameDiv.setAttribute("class", 'game')

                for (let j = 1; j <= 7; j++) {
                    const span = document.createElement("span")
                    span.setAttribute("id", `game_${i}_${j}`)
                    span.setAttribute("class", `number`)
                    span.innerHTML = Config.exportObject[`game${i}`].numbers[j - 1]
                    gameDiv.appendChild(span)
                }

                const spanPB = document.createElement("span")
                spanPB.setAttribute("id", `game_${i}_powerball`)
                spanPB.setAttribute("class", "powerball")

                spanPB.appendChild(Helper.buildPBDropdown(i, powerballArray[i - 1]))
                gameDiv.appendChild(spanPB)

                gameDiv.appendChild(Helper.buildRefineInput(i))


                Config.exportObject[`game${i}`].powerball = powerballArray[i - 1]

                numbersDiv.appendChild(gameDiv)

                if (data && data[`game${i}`].range) {
                    document.getElementById(`refine_text_${i}`).value = json[`game${i}`].range
                }

            }

            if (data) {

                if (data.isPowerballEditable) {
                    if (document.querySelector(".powerball-toggle i")) {
                        document.querySelector(".powerball-toggle i").style.color = '#000'
                    }

                }
                else {
                    if (document.querySelector(".powerball-toggle i")) {
                        document.querySelector(".powerball-toggle i").style.color = '#ccc'
                    }
                }

                document.querySelector(".render").style.display = "inline-block"
            }

            document.querySelector(".clear-games").style.display = "block"

        }

    }

    static refineNumbers = (e) => {
        const game = e.target.closest('.refine-button').getAttribute("data-game"),
            value = document.getElementById(`refine_text_${game}`).value

        if (!value) {
            alert('No input detected.')
            return;
        }
        // console.log(`game: ${game}`)
        // console.log(`value: ${value}`)

        let range = value.replace(/\s/g, '')
        const arraySplit = range.split("-")

        if (arraySplit.length != 2) {
            alert('Incorrect range format.')
            return
        }

        const min = parseInt(arraySplit[0]),
            max = parseInt(arraySplit[1])

        if (isNaN(min) || isNaN(max)) {
            alert('Invalid input.')
            return false;
        }

        if (max < min) {
            alert(`Minimum range value cannot be greater than maximum range value.`)
            return false
        }

        if (min < Config.number.min || min > Config.number.max - 6) {
            alert(`Minimum value cannot be less than ${Config.number.min} or greater than ${Config.number.max - 6}.`)
            return false
        }

        if (max > Config.number.max) {
            alert(`Maximum value cannot be greater than ${Config.number.max}.`)
            return false
        }

        if (max - min < 6) {
            alert(`Difference between minimum and maximum values cannot be less than 6.`)
            return false
        }

        const numArray = []

        for (let j = 1; j <= 7; j++) {
            let randomNum = Helper.randomiseWithinRange(min, max)
            while (numArray.includes(randomNum)) {
                randomNum = Helper.randomiseWithinRange(min, max)
            }
            numArray.push(randomNum)
        }


        numArray.sort(function (a, b) {
            return a - b;
        })

        for (let j = 1; j <= 7; j++) {
            const id = `game_${game}_${j}`
            document.getElementById(id).innerHTML = numArray[j - 1]
        }

        Config.exportObject[`game${game}`].numbers = numArray
        Config.exportObject[`game${game}`].range = range


    }

    static importData = () => {

        const e = document.getElementById('importJson')
        if (e.files && e.files.length > 0) {

            const file = e.files[0].name,
                ext = file.split('.')[1].toLowerCase()

            if (ext !== 'json') {
                alert('Invalid input file.')
                return
            }

            const fr = new FileReader();

            fr.onload = (e) => {
                const json = JSON.parse(e.target.result);
                if (json) {
                    Helper.renderNumbers(json)
                }
            }

            fr.readAsText(e.files[0]);
        }

    }

    static saveData = async () => {

        //2022-09-22T04:15:53.790Z
        const dateStamp = Config.exportObject.dateStamp.replace(/:\s*/g, "-").replace('.', '-'),
            file = `PowerballX_Data_${dateStamp}.json`,
            blob = new Blob([JSON.stringify(Config.exportObject)], { type: 'application/json;charset=utf-8' }),
            base64 = btoa(JSON.stringify(Config.exportObject))

        if (Capacitor.isNativePlatform()) {
            try {
                await Filesystem.writeFile({
                    path: file,
                    data: base64,
                    directory: Directory.External,
                    //encoding: Encoding.UTF8,
                }).then(() => {
                    Filesystem.getUri({
                        directory: Directory.External,
                        path: file
                    }).then((result) => {
                        const path = result.uri
                        alert(`Data file saved to: ${path}`)
                        // How to open a file
                        // cordova.plugins.fileOpener2.open(
                        //     path,
                        //     'application/json',
                        //     {
                        //         error: () => alert(`File cannot be opened. Please try installing a JSON Viewer.`),
                        //         success: () => { }
                        //     }
                        // )
                    }, (error) => {
                        alert(error)
                    })
                })
            }
            catch (err) {
                alert(err)
            }
        } else {
            FileSaver.saveAs(blob, file)
        }
    }
    static formatPBElement = () => {

        const gameCount = document.querySelector(".game-count").value
        if (gameCount > 0) {
            for (let i = 1; i <= gameCount; i++) {
                const spanPB = document.getElementById(`game_${i}_powerball`),
                    // We need original state before click so we use !(NOT) to revert to original
                    PB = !Config.isPowerballEditable ? spanPB.firstChild.value : spanPB.firstChild.innerHTML
                spanPB.innerHTML = ''
                spanPB.appendChild(Helper.buildPBDropdown(i, PB))

            }
        }

    }

}





