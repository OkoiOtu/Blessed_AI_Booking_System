/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_986407980")

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "number3492581806",
    "max": null,
    "min": null,
    "name": "quoted_price",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1348939242",
    "max": 0,
    "min": 0,
    "name": "quoted_currency",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1842259570",
    "max": 0,
    "min": 0,
    "name": "pricing_rule",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4265829493",
    "max": 0,
    "min": 0,
    "name": "vehicle_type",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_986407980")

  // remove field
  collection.fields.removeById("number3492581806")

  // remove field
  collection.fields.removeById("text1348939242")

  // remove field
  collection.fields.removeById("text1842259570")

  // remove field
  collection.fields.removeById("text4265829493")

  return app.save(collection)
})
