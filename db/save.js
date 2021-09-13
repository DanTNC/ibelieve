module.exports = (mappingModel, data, callback) => {
    mappingModel.findOne({uid: data.uid}, function(err, mapping) {
        if(err) {
            callback([false, "connect to DB failed"])
            return console.log(err)
        }

        if(mapping == null) {
            console.log("save mapping")
            var mapping = new mappingModel(data)

            mapping.save(function(err) {
                if(err) {
                    callback([false, "connect to DB failed"])
                    return console.log(err)
                }
    
                callback([true, data.access])
            })
        } else {
            console.log("update mapping")
            mapping.access = data.access
            mapping.refresh = data.refresh
            mapping.save(function(err) {
                if(err) {
                    callback([false, "connect to DB failed"])
                    return console.log(err)
                }

                callback([true, mapping.access])
            })
        }
    })
}