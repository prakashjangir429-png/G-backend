import mongoose from 'mongoose';

const connectDB = async () => {
  console.log("jai ho")
  try {

    // mongodb+srv://prakashjangid429_db_user:prakashjangid429_db_user@cluster0.pz0odbb.mongodb.net/?appName=Cluster0
    // mongodb+srv://prakashjangid429_db_user:NeUAxcxLBp5wtC04@cluster0.hgagcls.mongodb.net/web
    const conn = await mongoose.connect("mongodb+srv://prakashjangid429_db_user:prakashjangid429_db_user@cluster0.pz0odbb.mongodb.net/?appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;