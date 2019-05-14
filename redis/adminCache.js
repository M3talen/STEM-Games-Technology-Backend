const client = require("./index").client()

add = (key, data) => {
    client.hset("admin:data", key, data, client.print);
}

get = (key, cb) => {
    client.hget("admin:data", key, (err,res) => {
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