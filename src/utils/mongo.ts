import Mongoose from 'mongoose';

export = class Mongo {
  static async connect(mongoose: typeof Mongoose, url: string) {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
  }

  static async disconnect(mongoose: typeof Mongoose) {
    await Promise.all(
      mongoose.connections.map(async (connection) => {
        await connection.close();
      })
    );
  }
};
