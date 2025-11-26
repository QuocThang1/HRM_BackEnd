require("dotenv").config();
const mongoose = require("mongoose");

const initNotificationCollection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);

    const db = mongoose.connection.db;

    // Drop existing collection if it exists
    try {
      await db.dropCollection("tblnotifications");
    } catch (err) {
      console.log("Collection doesn't exist yet, creating new one");
    }

    // Create collection with proper JSON schema validation
    await db.createCollection("tblnotifications", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["title", "message", "type", "scope"],
          properties: {
            _id: { bsonType: "objectId" },
            title: { bsonType: "string" },
            message: { bsonType: "string" },
            type: {
              enum: ["info", "warning", "error", "success"],
              description: "Notification type",
            },
            recipientId: {
              bsonType: ["objectId", "null"],
              description: "User recipient, null for broadcast",
            },
            senderId: {
              bsonType: ["objectId", "null"],
              description: "User who triggered the notification",
            },
            relatedTo: { bsonType: "string" },
            action: {
              enum: [
                "CREATE",
                "UPDATE",
                "DELETE",
                "LOGIN",
                "CHECK_IN",
                "CHECK_OUT",
              ],
              description: "Action that triggered notification",
            },
            departmentId: {
              bsonType: ["objectId", "null"],
              description: "Associated department",
            },
            read: { bsonType: "bool" },
            scope: {
              enum: ["personal", "department", "all"],
              description: "Notification visibility scope",
            },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    });

    // Create indexes for better query performance
    await db.collection("tblnotifications").createIndex({ createdAt: -1 });
    await db.collection("tblnotifications").createIndex({ senderId: 1 });
    await db.collection("tblnotifications").createIndex({ scope: 1 });
    await db.collection("tblnotifications").createIndex({ read: 1 });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

initNotificationCollection();
