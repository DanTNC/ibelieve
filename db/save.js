module.exports = (mappingModel, data, callback) => {
    console.log("save mapping")

    mappingModel.findOne({uid: data.uid}, function(err, mapping) {
        if(err) {
            callback([false, "connect to DB failed"])
            return console.log(err)
        }

        if(mapping == null) {
            var mapping = new mappingModel(data)

            mapping.save(function(err) {
                if(err) {
                    callback([false, "connect to DB failed"])
                    return console.log(err)
                }
    
                callback([true, data.access])
            })
        } else {
            mapping.update({uid: data.uid}, data, function(err) {
                if(err) {
                    callback([false, "connect to DB failed"])
                    return console.log(err)
                }

                callback([true, data.access])
            })
        }
    })
}