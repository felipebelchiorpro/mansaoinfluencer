/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wtxr0h0ccouge8e")

  // remove
  collection.schema.removeField("9wwbe8en")

  // remove
  collection.schema.removeField("ljvq8lvu")

  // remove
  collection.schema.removeField("kt8cpdmm")

  // remove
  collection.schema.removeField("uu4zzhar")

  // remove
  collection.schema.removeField("pnxsm4fx")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "c4cicjtm",
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
    "id": "qkjftbfh",
    "name": "video_url",
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
    "id": "1tsv3nuq",
    "name": "patrocinador",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "eagpfydg213gn1w",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rruhllre",
    "name": "membros",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "taxzsnwrye1y54x",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "m61ia1qn",
    "name": "votos_count",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wtxr0h0ccouge8e")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9wwbe8en",
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
    "id": "ljvq8lvu",
    "name": "video_url",
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
    "id": "kt8cpdmm",
    "name": "patrocinador",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "eagpfydg213gn1w",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "uu4zzhar",
    "name": "membros",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "taxzsnwrye1y54x",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pnxsm4fx",
    "name": "votos_count",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": null,
      "noDecimal": false
    }
  }))

  // remove
  collection.schema.removeField("c4cicjtm")

  // remove
  collection.schema.removeField("qkjftbfh")

  // remove
  collection.schema.removeField("1tsv3nuq")

  // remove
  collection.schema.removeField("rruhllre")

  // remove
  collection.schema.removeField("m61ia1qn")

  return dao.saveCollection(collection)
})
