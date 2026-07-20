/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wtxr0h0ccouge8e")

  // remove
  collection.schema.removeField("o3ujdzpw")

  // remove
  collection.schema.removeField("qwrxubyi")

  // remove
  collection.schema.removeField("qt0a6zdb")

  // remove
  collection.schema.removeField("kafclkop")

  // remove
  collection.schema.removeField("bbw9cwkl")

  // remove
  collection.schema.removeField("urqxrvss")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "me0mg9xa",
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
    "id": "ddirj08r",
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
    "id": "gfaf31ad",
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
    "id": "mkxmkxhw",
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
    "id": "vj5kqhmz",
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
    "id": "lmopxxhd",
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
    "id": "o3ujdzpw",
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
    "id": "qwrxubyi",
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
    "id": "qt0a6zdb",
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
    "id": "kafclkop",
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
    "id": "bbw9cwkl",
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
    "id": "urqxrvss",
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
  collection.schema.removeField("me0mg9xa")

  // remove
  collection.schema.removeField("ddirj08r")

  // remove
  collection.schema.removeField("gfaf31ad")

  // remove
  collection.schema.removeField("mkxmkxhw")

  // remove
  collection.schema.removeField("vj5kqhmz")

  // remove
  collection.schema.removeField("lmopxxhd")

  return dao.saveCollection(collection)
})
