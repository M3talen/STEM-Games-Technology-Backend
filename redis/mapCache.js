const client = require("./index").client()
const teamCache = require("./teamCache")
var _ = require("lodash")
add = (x, y, data) => {
    client.hset("map:data", "(" + x + "," + y + ")", data, client.print);
}

get = (x, y, cb) => {
    client.hget("map:data", "(" + x + "," + y + ")", (err, res) => {
        if (err) {
            console.log(folder, err)
        } else {
            cb(res)
        }
    })
}
getAll = (cb) => {
    client.hgetall("map:data", (err, res) => {
        if (err) {
            console.log(folder, err)
        } else {
            cb(res)
        }
    })
}
/*
    Returns valid moves for a given location.
*/
getValid = (id, x, y, cb) => {
    x = Number(x)
    y = Number(y)
    teamCache.get(id, teamData => {
        client.hmget("map:data",
            "(" + (x - 1) + "," + y + ")",
            "(" + (x + 1) + "," + y + ")",
            "(" + x + "," + (y - 1) + ")",
            "(" + x + "," + (y + 1) + ")",
            (err, res) => {
                if (err) {
                    console.log(folder, err)
                } else {
                    moves = [1, 1, 1, 1]
                    res.forEach((block, index) => {
                        if (block === null) {
                            moves[index] = 0
                            return
                        }
                        block = JSON.parse(block)
                        if (block.blockData.type === "wall" || block.blockData.type === "gateway")
                            moves[index] = 0
                        if (block.blockData.type === "gateway") {
                            if (block.displayMetadata && block.displayMetadata.keys) {
                                solved = JSON.parse(teamData.team.solved)
                                if (solved && solved.array) {
                                    _.forEach(block.displayMetadata.keys, key => {
                                        if (solved.array.includes(key)) {
                                            moves[index] = 1
                                        } else {
                                            moves[index] = 0
                                            return false
                                        }
                                    })
                                }
                            };
                        }

                    });
                    validMoves = {
                        up: moves[0] ? true : false,
                        down: moves[1] ? true : false,
                        left: moves[2] ? true : false,
                        right: moves[3] ? true : false,
                    }
                    cb(validMoves)
                }
            })
    })

}

module.exports = {
    add,
    get,
    getAll,
    getValid
}