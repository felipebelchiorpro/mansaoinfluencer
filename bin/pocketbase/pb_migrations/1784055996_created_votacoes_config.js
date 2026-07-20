/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "chnp9vz9be6xfuf",
    "created": "2026-07-14 19:06:36.914Z",
    "updated": "2026-07-14 19:06:36.914Z",
    "name": "votacoes_config",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "dycmibws",
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
      },
      {
        "system": false,
        "id": "bum2piev",
        "name": "ativa",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "d8w1pe4s",
        "name": "expira_em",
        "type": "date",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
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
  const collection = dao.findCollectionByNameOrId("chnp9vz9be6xfuf");

  return dao.deleteCollection(collection);
})
