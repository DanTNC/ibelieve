module.exports = (mappingModel, uid, callback) => {
    console.log("load mapping")

    mappingModel.findOne({uid: uid}, function(err, mapping) {
        if(err) {
            callback([false, "connect to DB failed"])
            return console.log(err)
        }

        if(mapping == null) {
            callback([false, "no record found in DB"])
        } else {
            callback([true, mapping])
        }
    })
}