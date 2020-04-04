// import Redis from 'ioredis';
// import mongoose from 'mongoose';
// import { ConfigDatastores } from '../../typings';

//  class DB {
//   config?: ConfigDatastores;

//   constructor(config: ConfigDatastores) {
//     this.config = config;
//   }

//   async connect() {
//     if (this.default.type === 'mongo' && this.default.url) {
//       this.defaultDB = await mongoose.connect(this.config.default.url, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         useCreateIndex: true,
//         useFindAndModify: false
//       });
//     }

//     if (this.config?.cache) {
//       const redis = new Redis(this.config.cache.url);
//       this.cache = redis;
//     }
//   }

//   async disconnect() {
//     if (this.default) {
//       await Promise.all(
//         this.default.connections.map(async (connection) => {
//           await connection.close();
//         })
//       );
//     }

//     if (this.cache) {
//       this.cache.disconnect();
//     }
//   }
// }
