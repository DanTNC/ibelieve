var mongoose = require('mongoose');

module.exports = () => {
    mongoose.connect(
        'mongodb+srv://msoeadmin:'+process.env.mlab+'@msoe.iidb2.gcp.mongodb.net/msoe?retryWrites=true&w=majority',
        {useNewUrlParser: true, useUnifiedTopology: true, dbName: "ibelieve"}
    );
    
    return mongoose;
};