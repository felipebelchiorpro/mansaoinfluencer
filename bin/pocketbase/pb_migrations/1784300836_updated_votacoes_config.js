/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("chnp9vz9be6xfuf")

  // remove
  collection.schema.removeField("u7z2hc45")

  // remove
  collection.schema.removeField("0ejwrn4x")

  // remove
  collection.schema.removeField("8zuwt0f1")

  // remove
  collection.schema.removeField("xolpvxqu")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "blrphri3",
    "name": "titulo",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jgrepsm1",
    "name": "ativa",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ljq8f9ri",
    "name": "expira_em",
    "type": "date",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "q20xbhaj",
    "name": "tipo",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("chnp9vz9be6xfuf")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "u7z2hc45",
    "name": "titulo",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0ejwrn4x",
    "name": "ativa",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8zuwt0f1",
    "name": "expira_em",
    "type": "date",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xolpvxqu",
    "name": "tipo",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // remove
  collection.schema.removeField("blrphri3")

  // remove
  collection.schema.removeField("jgrepsm1")

  // remove
  collection.schema.removeField("ljq8f9ri")

  // remove
  collection.schema.removeField("q20xbhaj")

  return dao.saveCollection(collection)
})
