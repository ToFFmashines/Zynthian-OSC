// Custom module for Zyntian Mixer Open Stage Control Tempalte

// definition of Zyntian address for init sequention
var zyn_host = '192.168.88.102'
var zyn_port = '1370'

// Global definition of function beat
let beat = () => {
    send(zyn_host,zyn_port,'/mixer/heartbeat',{ type: 's', value: '' });
};


module.exports = {

    init: function(){
    // this will be executed once when the osc server starts

	// Wait 1 seconds and just once shot
	setTimeout(beat, 1000)

	// Every 60 seconds beat to zynthian
	setInterval(beat, 60000)
    },
	
	stop: function(){
        // this will be executed once when the osc server stops
        // it is called for the main module only
    },

    reload: function(){
        // this will be executed after the custom module is reloaded
        // it is called for the main module only
		setInterval(beat, 60000)
    },

    oscInFilter:function(data){
        // Filter incoming osc messages
        var {address, args, host, port} = data

        // do what you want

        // address = string
        // args = array of {value, type} objects
        // host = string
        // port = integer

        // return data if you want the message to be processed

        return {address, args, host, port}

    },
	
	oscOutFilter:function(data){
        // Filter outgoing osc messages

        var {address, args, host, port, clientId} = data

        // same as oscInFilter

        // return data if you want the message to be and sent
        return {address, args, host, port}
    },

    unload: function(){
        // this will be executed before the custom module is reloaded
        // it is called for all modules, including other loaded modules
    },
}