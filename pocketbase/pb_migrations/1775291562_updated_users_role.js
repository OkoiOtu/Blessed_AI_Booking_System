/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1716581620")

  // add field
  collection.fields.addAt(3, new Field({
    "exceptDomains": [],
    "hidden": false,
    "id": "email2962097998",
    "name": "email_address",
    "onlyDomains": [],
    "presentable": false,
    "required": true,
    "system": false,
    "type": "email"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text901924565",
    "max": 0,
    "min": 6,
    "name": "password",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1716581620")

  // remove field
  collection.fields.removeById("email2962097998")

  // remove field
  collection.fields.removeById("text901924565")

  return app.save(collection)
})
