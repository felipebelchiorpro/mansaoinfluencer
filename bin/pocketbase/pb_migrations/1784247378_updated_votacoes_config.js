/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("chnp9vz9be6xfuf")

  // remove
  collection.schema.removeField("pl9a2hak")

  // remove
  collection.schema.removeField("5fu5k1eb")

  // remove
  collection.schema.removeField("wzcccu64")

  // remove
  collection.schema.removeField("obedd3c1")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cxkbsvzo",
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
    "id": "0mupuifs",
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
    "id": "9akxomes",
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
    "id": "qfzstzwc",
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
    "id": "pl9a2hak",
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
    "id": "5fu5k1eb",
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
    "id": "wzcccu64",
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
    "id": "obedd3c1",
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
  collection.schema.removeField("cxkbsvzo")

  // remove
  collection.schema.removeField("0mupuifs")

  // remove
  collection.schema.removeField("9akxomes")

  // remove
  collection.schema.removeField("qfzstzwc")

  return dao.saveCollection(collection)
})
