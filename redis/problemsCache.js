const client = require("./index").client()

add = (key, data) => {
    client.hset("problems:data", key, data, client.print);
}

get = (key, cb) => {
    client.hget("problems:data", key, (err,res) => {
        if(err){
            console.log(folder, err)
        }else{
            cb(res)
        }
    })
}

module.exports = {
    add,
    get
}