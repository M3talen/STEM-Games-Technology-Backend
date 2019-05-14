const client = require("./index").client()


set = (key, data) => {
    data = JSON.stringify(data)
    client.hset("team:data", key, data, client.print);
}

get = (key, cb) => {
    client.hget("team:data", key, (err,res) => {
        if(err){
            console.log(folder, err)
        }else{
            data = JSON.parse(res)
            cb(data)
        }
    })
}

getAll = (cb) => {
    client.hgetall("team:data", (err, res) => {
        if (err) {
            console.log(folder, err)
        } else {
            cb(res)
        }
    })
}
module.exports = {
    set,
    get,
    getAll
}