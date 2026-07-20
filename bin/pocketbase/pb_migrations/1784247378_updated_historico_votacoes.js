/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bgq1zr8yu7phg6s")

  // remove
  collection.schema.removeField("hl8s1iwd")

  // remove
  collection.schema.removeField("giv7p6mc")

  // remove
  collection.schema.removeField("2glxzcox")

  // remove
  collection.schema.removeField("d2auluuu")

  // remove
  collection.schema.removeField("swfihy8k")

  // remove
  collection.schema.removeField("6splu14y")

  // remove
  collection.schema.removeField("xfblgdk5")

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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bgq1zr8yu7phg6s")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hl8s1iwd",
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
    "id": "giv7p6mc",
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
    "id": "2glxzcox",
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
    "id": "d2auluuu",
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
    "id": "swfihy8k",
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
    "id": "6splu14y",
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
    "id": "xfblgdk5",
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

  return dao.saveCollection(collection)
})
