module.exports = (mongoose) => {
    var mappingSchema = new mongoose.Schema({
        uid: String,
        access: String,
        refresh: String,
        name: String,
        email: String,
    })

    var mappingModel = mongoose.model('MAPPING', mappingSchema, 'map')

    return mappingModel
}