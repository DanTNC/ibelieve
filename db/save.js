module.exports = (mappingModel, data, callback) => {
    mappingModel.findOne({uid: data.uid}, function(err, mapping) {
        if(err) {
            callback([false, "connect to DB failed"])
            return console.log(err)
        }

        if(mapping == null) {
            mappingModel.findOne({email: data.email}, function(err, mapping) {
                if(err) {
                    callback([false, "connect to DB failed"])
                    return console.log(err)
                }
                
                if (mapping == null) {
                    console.log("insert new mapping")
                    var mapping = new mappingModel(data)
        
                    mapping.save(function(err) {
                        if(err) {
                            callback([false, "connect to DB failed"])
                            return console.log(err)
                        }
            
                        callback([true, data.access])
                    })
                } else {
                    console.log("update mapping with same email")
                    mapping.access = data.access
                    mapping.refresh = data.refresh
                    mapping.uid = data.uid
                    mapping.save(function(err) {
                        if(err) {
                            callback([false, "connect to DB failed"])
                            return console.log(err)
                        }
        
                        callback([true, mapping.access])
                    })
                }
            })
        } else {
            console.log("update mapping with same uid")
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