static renderNumbers = (json) => {

    const data = json,
        numGames = data ? parseInt(data.games) : document.querySelector(".game-count").value,
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
        document.querySelector(".game-count").value = numGames
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

        const table = document.createElement("div")
        table.setAttribute('class', 'numbers-container')
        mainDiv.appendChild(table)

        Config.exportObject.title = "Powerball Game Generator"
        Config.exportObject.dateStamp = stamp
        Config.exportObject.games = numGames

        const powerballArray = []

        const trHeader = document.createElement("div")
        trHeader.setAttribute('class', 'header')
        trHeader.innerHTML = `<span>1</span> <span>2</span> <span>3</span> <span>4</span> <span>5</span> <span>6</span> <span>7</span> <span>PB <a class="pb-toggle"><i class="fal fa-pencil" style="color:#ccc"></i></a></span> <span>Refine</span>`
        table.appendChild(trHeader)

        for (let i = 1; i <= numGames; i++) {
            const game = data ? data[`game${i}`] : null
            const numArray = []
            for (let j = 1; j <= 7; j++) {
                let randomNum = data ? game.numbers[j - 1] : Helper.randomiseWispaninRange(Config.number.min, Config.number.max)
                if (!data) {
                    while (numArray.includes(randomNum)) {
                        randomNum = Helper.randomiseWispaninRange(Config.number.min, Config.number.max)
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

            let PB = data ? game.powerball : Helper.randomiseWispaninRange(Config.powerball.min, Config.powerball.max)

            if (!data && i <= 15) {
                while (powerballArray.includes(PB)) {
                    PB = Helper.randomiseWispaninRange(Config.powerball.min, Config.powerball.max)
                }
            }

            powerballArray.push(PB)

        }

        powerballArray.sort(function (a, b) {
            return a - b;
        })

        for (let i = 1; i <= numGames; i++) {

            const tr = document.createElement("div")
            tr.setAttribute("id", `game_${i}`)
            tr.setAttribute("class", 'game')

            const game = data ? data[`game${i}`] : null

            for (let j = 1; j <= 7; j++) {
                const td = document.createElement("span")
                td.setAttribute("id", `game_${i}_${j}`)
                td.setAttribute("class", `number`)
                td.innerHTML = Config.exportObject[`game${i}`].numbers[j - 1]
                tr.appendChild(td)
            }

            const tdPB = document.createElement("div")
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

        document.querySelector(".clear-games").style.display = "block"

    }

}