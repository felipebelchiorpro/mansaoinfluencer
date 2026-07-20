/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bgq1zr8yu7phg6s")

  // remove
  collection.schema.removeField("anvfelat")

  // remove
  collection.schema.removeField("iy50bpek")

  // remove
  collection.schema.removeField("jvcxb9kh")

  // remove
  collection.schema.removeField("gvsyj8bz")

  // remove
  collection.schema.removeField("0ojpr8xs")

  // remove
  collection.schema.removeField("t2wb1ryz")

  // remove
  collection.schema.removeField("uejvgwpr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zqh5uim5",
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
    "id": "ofqqmz3b",
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
    "id": "dswa0fes",
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
    "id": "jmm3cohu",
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
    "id": "hfb80qy4",
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
    "id": "kvjhj8fa",
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
    "id": "ytxscatx",
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
    "id": "anvfelat",
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
    "id": "iy50bpek",
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
    "id": "jvcxb9kh",
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
    "id": "gvsyj8bz",
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
    "id": "0ojpr8xs",
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
    "id": "t2wb1ryz",
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
    "id": "uejvgwpr",
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
  collection.schema.removeField("zqh5uim5")

  // remove
  collection.schema.removeField("ofqqmz3b")

  // remove
  collection.schema.removeField("dswa0fes")

  // remove
  collection.schema.removeField("jmm3cohu")

  // remove
  collection.schema.removeField("hfb80qy4")

  // remove
  collection.schema.removeField("kvjhj8fa")

  // remove
  collection.schema.removeField("ytxscatx")

  return dao.saveCollection(collection)
})
