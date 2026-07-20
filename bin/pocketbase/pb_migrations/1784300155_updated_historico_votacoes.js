/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bgq1zr8yu7phg6s")

  // remove
  collection.schema.removeField("nlgcsth5")

  // remove
  collection.schema.removeField("i0fjbitf")

  // remove
  collection.schema.removeField("ola5s6ix")

  // remove
  collection.schema.removeField("kxlrjfod")

  // remove
  collection.schema.removeField("hmkuxqbm")

  // remove
  collection.schema.removeField("agaalyo3")

  // remove
  collection.schema.removeField("kfxh6m5b")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wrhwcy3v",
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
    "id": "svhnmtln",
    "name": "tipo",
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
    "id": "oowzg4oz",
    "name": "ganhador",
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
    "id": "2qy4gplk",
    "name": "votos_ganhador",
    "type": "number",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lr5mreaj",
    "name": "votos_totais",
    "type": "number",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wlmgtcpg",
    "name": "detalhes",
    "type": "json",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9qlpzka4",
    "name": "data_encerramento",
    "type": "date",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bgq1zr8yu7phg6s")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nlgcsth5",
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
    "id": "i0fjbitf",
    "name": "tipo",
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
    "id": "ola5s6ix",
    "name": "ganhador",
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
    "id": "kxlrjfod",
    "name": "votos_ganhador",
    "type": "number",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hmkuxqbm",
    "name": "votos_totais",
    "type": "number",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "agaalyo3",
    "name": "detalhes",
    "type": "json",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kfxh6m5b",
    "name": "data_encerramento",
    "type": "date",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // remove
  collection.schema.removeField("wrhwcy3v")

  // remove
  collection.schema.removeField("svhnmtln")

  // remove
  collection.schema.removeField("oowzg4oz")

  // remove
  collection.schema.removeField("2qy4gplk")

  // remove
  collection.schema.removeField("lr5mreaj")

  // remove
  collection.schema.removeField("wlmgtcpg")

  // remove
  collection.schema.removeField("9qlpzka4")

  return dao.saveCollection(collection)
})
