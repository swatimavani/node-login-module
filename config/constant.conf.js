const carrom = {
    PORT:3001,
    database:"carrom",
    secret:"Carrom12#",
    userStatus:['offline','online','playing'],
    game:{
        "primaryCurrency":10,
        "secondaryCurrency":100,
        "allowSwitchingRoom" : true,
		"maxPlayersInRoom" : 2,
        "maxRooms" : 0,
    }
}

const test = {
    PORT:3002,
    database:"snackes_ladders",
    secret:"Snl12#",
    userStatus:['offline','online','playing'],
    game:{
        "primaryCurrency":10,
        "secondaryCurrency":100,
        "allowSwitchingRoom" : true,
		"maxPlayersInRoom" : 2,
        "maxRooms" : 0,
    }   
}

module.exports = {carrom,test};