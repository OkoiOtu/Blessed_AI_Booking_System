/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "resetPasswordTemplate": {
      "subject": "Reset your {APP_NAME} password"
    },
    "verificationTemplate": {
      "subject": "Verify your {APP_NAME} email"
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "resetPasswordTemplate": {
      "subject": "Reset your Ariva password"
    },
    "verificationTemplate": {
      "subject": "Verify your Ariva email"
    }
  }, collection)

  return app.save(collection)
})
