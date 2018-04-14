const roomStatus = {

    EXISTING_ROOM : 1,
    FULL_ROOM : 2,
    FRIEND_ROOM : 3

}

const carrom = {
    PORT:3001,
    database:"carrom",
    secret:"Carrom12#",
    userStatus:['offline','online','playing'],
    game:{
        "primaryCurrency":10,
        "secondaryCurrency":100,       
		"maxPlayersInRoom" : 2      
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
		"maxPlayersInRoom" : 2       
    }   
}

module.exports = {carrom,test,roomStatus};