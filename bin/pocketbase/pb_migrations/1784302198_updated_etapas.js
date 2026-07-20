/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pn0v7e37x9iy8q0")

  // remove
  collection.schema.removeField("3dxq40jz")

  // remove
  collection.schema.removeField("0nikmokb")

  // remove
  collection.schema.removeField("hd4nqt2s")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "i7qncntk",
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
    "id": "serukuvv",
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
    "id": "xzrp0za8",
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

  // remove
  collection.schema.removeField("i7qncntk")

  // remove
  collection.schema.removeField("serukuvv")

  // remove
  collection.schema.removeField("xzrp0za8")

  return dao.saveCollection(collection)
})
