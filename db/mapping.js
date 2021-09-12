module.exports = (mongoose) => {
    var mappingSchema = new mongoose.Schema({
        uid: String,
        access: String,
        refresh: String
    })

    var mappingModel = mongoose.model('MAPPING', mappingSchema, 'map')

    return mappingModel
}