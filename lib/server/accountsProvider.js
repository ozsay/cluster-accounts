Cluster.startProvider = function() {
    LoggedInUsers = new Mongo.Collection("loggedInUsers", {connection: null});

    Meteor.users.find().observe({
        added: function(doc) {
            if (doc.services !== undefined &&
                doc.services.resume !== undefined &&
                doc.services.resume.loginTokens !== undefined &&
                doc.services.resume.loginTokens.length > 0) {
                LoggedInUsers.upsert(doc._id, {$set: {tokens: doc.services.resume.loginTokens}});
            } else {
                LoggedInUsers.remove(doc._id);
            }
        },
        changed: function(doc) {
            if (doc.services !== undefined &&
                doc.services.resume !== undefined &&
                doc.services.resume.loginTokens !== undefined &&
                doc.services.resume.loginTokens.length > 0) {
                LoggedInUsers.upsert(doc._id, {$set: {tokens: doc.services.resume.loginTokens}});
            } else {
                LoggedInUsers.remove(doc._id);
            }
        },
        removed: function(doc) {
            LoggedInUsers.remove(doc._id);
        }
    });

    Meteor.publish(null, function() {
        return Meteor.users.find({},
            {fields: {'services': 1}});
    });

    Meteor.publish("loggedInUsers", function(secret) {
        if  (secret === Cluster._accountsSecret) {
            return LoggedInUsers.find();
        } else {
            return null;
        }
    });
};
