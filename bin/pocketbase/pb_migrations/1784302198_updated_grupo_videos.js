/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bwg014z6o3qysej")

  // remove
  collection.schema.removeField("7iiquwiw")

  // remove
  collection.schema.removeField("0ps7dhb0")

  // remove
  collection.schema.removeField("v5ppdben")

  // remove
  collection.schema.removeField("sc95wpze")

  // remove
  collection.schema.removeField("j0glal1e")

  // remove
  collection.schema.removeField("ahrdvqiv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "n8s0bqsk",
    "name": "grupo",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "wtxr0h0ccouge8e",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lolppwlr",
    "name": "etapa",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "pn0v7e37x9iy8q0",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "z5swwqf4",
    "name": "video_url",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "apjbcckb",
    "name": "video_file",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "video/mp4",
        "video/webm",
        "video/quicktime"
      ],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 104857600,
      "protected": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gbgwcclx",
    "name": "patrocinador",
    "type": "relation",
    "required": false,
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
    "id": "hh8rakj1",
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
  const collection = dao.findCollectionByNameOrId("bwg014z6o3qysej")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7iiquwiw",
    "name": "grupo",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "wtxr0h0ccouge8e",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0ps7dhb0",
    "name": "etapa",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "pn0v7e37x9iy8q0",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "v5ppdben",
    "name": "video_url",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sc95wpze",
    "name": "video_file",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "video/mp4",
        "video/webm",
        "video/quicktime"
      ],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 104857600,
      "protected": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "j0glal1e",
    "name": "patrocinador",
    "type": "relation",
    "required": false,
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
    "id": "ahrdvqiv",
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
  collection.schema.removeField("n8s0bqsk")

  // remove
  collection.schema.removeField("lolppwlr")

  // remove
  collection.schema.removeField("z5swwqf4")

  // remove
  collection.schema.removeField("apjbcckb")

  // remove
  collection.schema.removeField("gbgwcclx")

  // remove
  collection.schema.removeField("hh8rakj1")

  return dao.saveCollection(collection)
})
