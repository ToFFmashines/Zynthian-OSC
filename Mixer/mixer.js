// Custom module for Zyntian Misexer Open Stage Control Tempalte

// definition of Zyntian address for init sequention
var zyn_host = '192.168.88.102'
var zyn_port = '1370'

module.exports = {

    init: ()=>{
     // this will be executed once when the osc server starts

        beat = ()=>{
            sendOsc({
                address: '/mixer/heartbeat',
                args: [{type:'s',value:''}],
                host: zyn_host,
                port: zyn_port
				}
			)
        }
	// Wait 1 seconds and just once shot
	setTimeout(beat, 1000)
	// Every 60 seconds beat to zynthian
	setInterval(beat, 60000)
    },

    oscInFilter:function(data){
        // Filter incoming osc messages
        var {address, args, host, port} = data

		var target = ""
		if (address.startsWith("/mixer/dpm")===0) {
			target = address.replace("/mixer/dpm", "");
			target = "_" + target.substr(0,1) + "_" +target.substr(0,1)
			console.log("target ",target)
		}

        return {address, args, host, port}

    },
}