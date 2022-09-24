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
        const pbSelect = document.createElement("select")
        pbSelect.setAttribute("id", `game_${i}_pb_select`)
        pbSelect.setAttribute("data-game", i)
        pbSelect.setAttribute("class", "pb-select")

        for (let k = Config.powerball.min; k <= Config.powerball.max; k++) {
            const option = document.createElement("option")
            option.value = k;
            option.innerHTML = k;

            if (k == PB) {
                option.setAttribute("selected", "")
            }
            pbSelect.append(option)

        }

        return pbSelect
    }

    static buildRefineInput = (i) => {
        const tdRefine = document.createElement("td")
        tdRefine.setAttribute("id", `game_${i}_refine`)
        tdRefine.setAttribute("class", "td-refine")
        tdRefine.setAttribute("data-game", i)
        tdRefine.innerHTML = `<input type="text" class="refine-text" id="refine_text_${i}" ><button type="button" data-game="${i}" class="refine-button"><i class="fal fa-sync"></i></button>`
        return tdRefine
    }

    static renderNumbers = (json) => {

        const data = json,
            numGames = data ? parseInt(data.games) : document.querySelector(".number-games").value,
            mainDiv = document.querySelector(".numbers")

        if (!data) {
            if (!numGames) {
                alert(`Please input number of games to be generated.`)
                return;
            }
            if (numGames < 0 || numGames > 100) {
                alert(`Valid number of games is from 1 to 100.`)
                return;
            }

        }


        if (data) {
            document.querySelector(".number-games").value = numGames
            if (data.isPowerballEditable) {
                Config.isPowerballEditable = true
                Config.exportObject.isPowerballEditable = true
            }
            else {
                Config.isPowerballEditable = false
                Config.exportObject.isPowerballEditable = false
            }
        }

        if (numGames > 0) {

            document.querySelector(".save").style.display = "block"
            const d = new Date()
            const stamp = d.toISOString()
            mainDiv.innerHTML = ""

            const table = document.createElement("table")
            mainDiv.appendChild(table)

            Config.exportObject.title = "Powerball Game Generator"
            Config.exportObject.dateStamp = stamp
            Config.exportObject.games = numGames

            const powerballArray = []

            const trHeader = document.createElement("tr")
            trHeader.setAttribute('class', 'header')
            trHeader.innerHTML = `<th>1</th> <th>2</th> <th>3</th> <th>4</th> <th>5</th> <th>6</th> <th>7</th> <th>PB <a class="pb-toggle"><i class="fal fa-pencil" style="color:#ccc"></i></a></th> <th>Refine</th>`
            table.appendChild(trHeader)

            for (let i = 1; i <= numGames; i++) {
                const game = data ? data[`game${i}`] : null
                const numArray = []
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

            for (let i = 1; i <= numGames; i++) {

                const tr = document.createElement("tr")
                tr.setAttribute("id", `game_${i}`)
                tr.setAttribute("class", 'game')

                const game = data ? data[`game${i}`] : null

                for (let j = 1; j <= 7; j++) {
                    const td = document.createElement("td")
                    td.setAttribute("id", `game_${i}_${j}`)
                    td.innerHTML = Config.exportObject[`game${i}`].numbers[j - 1]
                    tr.appendChild(td)
                }

                const tdPB = document.createElement("td")
                tdPB.setAttribute("id", `game_${i}_pb`)
                tdPB.setAttribute("class", "td-pb")

                tdPB.appendChild(Helper.buildPBDropdown(i, powerballArray[i - 1]))
                tr.appendChild(tdPB)

                tr.appendChild(Helper.buildRefineInput(i))


                Config.exportObject[`game${i}`].powerball = powerballArray[i - 1]

                table.appendChild(tr)

                if (data && data[`game${i}`].range) {
                    document.getElementById(`refine_text_${i}`).value = json[`game${i}`].range
                }

            }

            if (data) {

                if (data.isPowerballEditable) {
                    if (document.querySelector(".pb-toggle i")) {
                        document.querySelector(".pb-toggle i").style.color = '#000'
                    }

                }
                else {
                    if (document.querySelector(".pb-toggle i")) {
                        document.querySelector(".pb-toggle i").style.color = '#ccc'
                    }
                }

                document.querySelector(".generate").style.display = "inline-block"
            }

            document.querySelector(".clear-games").style.display = "inline-block"

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
            const id = `game_${game}_${j}`
            let randomNum = Helper.randomiseWithinRange(min, max)
            while (numArray.includes(randomNum)) {
                randomNum = Helper.randomiseWithinRange(min, max)
            }
            numArray.push(randomNum)
            document.getElementById(id).innerHTML = randomNum
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
                    directory: Directory.Data,
                    //encoding: Encoding.UTF8,
                }).then(() => {
                    Filesystem.getUri({
                        directory: Directory.Data,
                        path: file
                    }).then((result) => {
                        const path = result.uri
                        cordova.plugins.fileOpener2.open(
                            path,
                            'application/json',
                            {
                                error: () => alert(`File cannot be opened. Please try installing a JSON Viewer.`),
                                success: () => { }
                            }
                        )

                    }, (error) => {
                        alert(error)
                    })
                })
            }
            catch (err) {
                alert(err)
            }
        }
        else {
            FileSaver.saveAs(blob, file)
        }
    }

    /*
    static saveData = async (data, type, fname) => {

        try {
            const fileType = type === 'json' ? 'application/json;charset=utf-8' : 'text/html;charset=utf-8',
                file = fname + (type === 'json' ? '.json' : '.html'),
                _data = type === 'json' ? JSON.stringify(data) : data,
                blob = new Blob([_data], { type: fileType }),
                base64 = btoa(JSON.stringify(data))

            if (Capacitor.isNativePlatform()) {

                await Filesystem.writeFile({
                    path: file,
                    data: base64,
                    directory: Directory.Data,
                    //encoding: Encoding.UTF8,
                }).then((result) => {
                    Filesystem.getUri({
                        directory: Directory.Data,
                        path: file
                    }).then((getUriResult) => {
                        const path = getUriResult.uri
                        cordova.plugins.fileOpener2.open(
                            path,
                            'application/json',
                            {
                                error: () => alert(`File can't be opened. Please try installing a JSON Viewer.`),
                                success: () => alert(`Games saved to: ${path}. File will be opened for viewing or saving.`)
                            }
                        )

                    }, (error) => {
                        alert(error)
                    })
                })

            } else {
                FileSaver.saveAs(blob, file)
            }
        }
        catch (err) {
            alert(err)
        }
    } */

    static formatPBElement = () => {

        const numGames = document.querySelector(".number-games").value
        if (numGames > 0) {
            for (let i = 1; i <= numGames; i++) {
                const tdPB = document.getElementById(`game_${i}_pb`),
                    // We need original state before click so we use !(NOT) to revert to original
                    PB = !Config.isPowerballEditable ? tdPB.firstChild.value : tdPB.firstChild.innerHTML
                tdPB.innerHTML = ''
                tdPB.appendChild(Helper.buildPBDropdown(i, PB))

            }
        }

    }

}





