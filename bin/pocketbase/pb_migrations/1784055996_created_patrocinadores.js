/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "eagpfydg213gn1w",
    "created": "2026-07-14 19:06:36.914Z",
    "updated": "2026-07-14 19:06:36.914Z",
    "name": "patrocinadores",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "3fx2ndy9",
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
      },
      {
        "system": false,
        "id": "gzz0bm5a",
        "name": "logo_url",
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
        "id": "wko01zgj",
        "name": "link_site",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
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
  const collection = dao.findCollectionByNameOrId("eagpfydg213gn1w");

  return dao.deleteCollection(collection);
})
