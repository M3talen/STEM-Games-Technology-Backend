const client = require("./index").client()

set = (key, data) => {
    client.hset("team:status", key, data, client.print);
}

get = (key, cb) => {
    client.hget("team:status", key, (err,res) => {
        if(err){
            console.log(folder, err)
        }else{
            cb(res)
        }
    })
}

module.exports = {
    set,
    get
}