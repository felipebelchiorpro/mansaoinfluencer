/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pn0v7e37x9iy8q0",
    "created": "2026-07-17 14:55:55.726Z",
    "updated": "2026-07-17 14:55:55.726Z",
    "name": "etapas",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "zf4mazmb",
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
        "id": "y1u5tqc8",
        "name": "ativa",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "nbhpeenb",
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
  const collection = dao.findCollectionByNameOrId("pn0v7e37x9iy8q0");

  return dao.deleteCollection(collection);
})
