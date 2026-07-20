/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wtxr0h0ccouge8e")

  // remove
  collection.schema.removeField("qw7bvwxb")

  // remove
  collection.schema.removeField("qwobthll")

  // remove
  collection.schema.removeField("dapixxaj")

  // remove
  collection.schema.removeField("7dh6mgrw")

  // remove
  collection.schema.removeField("zvuby5oa")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tuqzbcew",
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
    "id": "lnux9sdd",
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
    "id": "jvssjpch",
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
    "id": "ldxfizbq",
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
    "id": "qdn6pctl",
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
    "id": "lp4uqnmd",
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
    "id": "qw7bvwxb",
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
    "id": "qwobthll",
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
    "id": "dapixxaj",
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
    "id": "7dh6mgrw",
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
    "id": "zvuby5oa",
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
  collection.schema.removeField("tuqzbcew")

  // remove
  collection.schema.removeField("lnux9sdd")

  // remove
  collection.schema.removeField("jvssjpch")

  // remove
  collection.schema.removeField("ldxfizbq")

  // remove
  collection.schema.removeField("qdn6pctl")

  // remove
  collection.schema.removeField("lp4uqnmd")

  return dao.saveCollection(collection)
})
