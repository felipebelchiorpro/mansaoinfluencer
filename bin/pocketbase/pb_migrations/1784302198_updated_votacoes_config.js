/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("chnp9vz9be6xfuf")

  // remove
  collection.schema.removeField("blrphri3")

  // remove
  collection.schema.removeField("jgrepsm1")

  // remove
  collection.schema.removeField("ljq8f9ri")

  // remove
  collection.schema.removeField("q20xbhaj")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xn8cbcxt",
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
    "id": "q91ri1uq",
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
    "id": "lvvatk87",
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
    "id": "iznrfntv",
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

  // remove
  collection.schema.removeField("xn8cbcxt")

  // remove
  collection.schema.removeField("q91ri1uq")

  // remove
  collection.schema.removeField("lvvatk87")

  // remove
  collection.schema.removeField("iznrfntv")

  return dao.saveCollection(collection)
})
