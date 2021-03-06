const roomStatus = {

    EXISTING_ROOM : 1,
    FULL_ROOM : 2,
    FRIEND_ROOM : 3

}

const carrom = {
    PORT:3001,
    database:"carrom",
    secret:"Carrom12#",
    userStatus:{
        ONLINE:"online",
        OFFLINE:"offline",
        PLAYING:"playing",
        REQUESTED:"requested"
    },
    game:{
        primaryCurrency:10,
        secondaryCurrency:100,       
		maxPlayersInRoom : 2      
    }
}

const snl = {
    PORT:3002,
    database:"snl",
    secret:"Snl12#",
    userStatus:{
        ONLINE:"online",
        OFFLINE:"offline",
        PLAYING:"playing",
        REQUESTED:"requested"
    },
    game:{
        primaryCurrency:10,
        secondaryCurrency:100,       
		maxPlayersInRoom : 2      
    }
}


module.exports = {carrom,snl,roomStatus};