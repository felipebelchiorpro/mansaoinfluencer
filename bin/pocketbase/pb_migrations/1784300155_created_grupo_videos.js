/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "bwg014z6o3qysej",
    "created": "2026-07-17 14:55:55.734Z",
    "updated": "2026-07-17 14:55:55.734Z",
    "name": "grupo_videos",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "wmdoyevu",
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
      },
      {
        "system": false,
        "id": "rivx6xy9",
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
      },
      {
        "system": false,
        "id": "rpqnhvcv",
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
      },
      {
        "system": false,
        "id": "v6ztip4t",
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
      },
      {
        "system": false,
        "id": "9nekvfwv",
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
      },
      {
        "system": false,
        "id": "ua0easfz",
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
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("bwg014z6o3qysej");

  return dao.deleteCollection(collection);
})
