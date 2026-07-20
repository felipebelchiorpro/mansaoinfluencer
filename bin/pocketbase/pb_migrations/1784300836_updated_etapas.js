/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pn0v7e37x9iy8q0")

  // remove
  collection.schema.removeField("zf4mazmb")

  // remove
  collection.schema.removeField("y1u5tqc8")

  // remove
  collection.schema.removeField("nbhpeenb")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "3dxq40jz",
    "name": "nome",
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
    "id": "0nikmokb",
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
    "id": "hd4nqt2s",
    "name": "descricao",
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
  const collection = dao.findCollectionByNameOrId("pn0v7e37x9iy8q0")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zf4mazmb",
    "name": "nome",
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
    "id": "y1u5tqc8",
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
    "id": "nbhpeenb",
    "name": "descricao",
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
  collection.schema.removeField("3dxq40jz")

  // remove
  collection.schema.removeField("0nikmokb")

  // remove
  collection.schema.removeField("hd4nqt2s")

  return dao.saveCollection(collection)
})
