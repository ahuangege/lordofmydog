export default {
    "development": {
        "login": [
            { "id": "login", "host": "127.0.0.1", "port": 5102, "loginHttpPort": 5101 }
        ],
        "connector": [
            { "id": "con-0", "host": "127.0.0.1", "port": 5110, "frontend": true, "clientHost": "127.0.0.1", "clientPort": 5120 },
        ],
        "info": [
            { "id": "info-0", "host": "127.0.0.1", "port": 5130 },
        ],
        "map": [
            { "id": "map-0", "host": "127.0.0.1", "port": 5150, "mapIds": [1], "loadCopy": true },
        ]
    },
    "production": {

    }
}