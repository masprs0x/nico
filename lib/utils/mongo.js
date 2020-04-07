"use strict";
module.exports = class Mongo {
    static async connect(mongoose, url) {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
    }
    static async disconnect(mongoose) {
        await Promise.all(mongoose.connections.map(async (connection) => {
            await connection.close();
        }));
    }
};
