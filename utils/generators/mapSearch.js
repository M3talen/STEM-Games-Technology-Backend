var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var mapController = require("../../controllers/map")

var array = [];
var problems = [];
var startingPosition;

createMap = (file, cb) => {
    var instream = fs.createReadStream(file);
    var outstream = new stream;
    var rl = readline.createInterface(instream, outstream);
   
    rl.on('line', function (line) {
        array.push(line.split(""));
    });

    rl.on('close', function () {
        arr = bfs(0, 0)
        
        mapData = []
        console.log(array.length, array[0].length)
        
        array.forEach((row, i) => {
            console.log(row.join(""))
            row.forEach((el, j) => {
                mapData.push({
                    x: i,
                    y: j,
                    blockData: {
                        type: el === "█" ? "wall" : el === "." ? "path" : el === "s" ? "start" : el === "p" ? "problem" : el === "#" ? "gateway" : null
                    },
                    blockType: el === "█" ? "wall" : el === "." ? "path" : el === "s" ? "start" : el === "p" ? "problem" : el === "#" ? "gateway" : "" 
                        
                })
                if (el === "p")
                    problems.push({
                        x: i,
                        y: j
                    })
                if (el === "s")
                    startingPosition = { x: i, y: j }
            })
        })
        mapController.add(mapData)
        cb({
            problems: problems,
            startingPosition: startingPosition,
            dimX:array.length,
            dimY:array[0].length
        })
    });
}


bfs = (x, y) => {
    if (array[x][y] === '.')
        array[x][y] = ''

    if (array[x][y + 1]) {
        if (array[x][y + 1] === '.')
            bfs(x, y + 1)
    }

    if (array[x + 1] && array[x + 1][y]) {
        if (array[x + 1][y] === '.')
            bfs(x + 1, y)
    }

    if (array[x][y - 1]) {
        if (array[x][y - 1] === '.')
            bfs(x, y - 1)
    }

    if (array[x - 1] && array[x - 1][y]) {
        if (array[x - 1][y] === '.')
            bfs(x - 1, y)
    }

};


module.exports = {
    createMap
}