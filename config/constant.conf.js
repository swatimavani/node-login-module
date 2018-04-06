const secret = "TagGamesSecret12#"
const carrom = {
    PORT:3001,
    database:"carrom",
    game:{
        "primaryCurrency":10,
        "secondaryCurrency":100,
        "allowSwitchingRoom" : true,
		"maxPlayersInRoom" : 2,
        "maxRooms" : 0,
    }
}

module.exports = {carrom,secret};