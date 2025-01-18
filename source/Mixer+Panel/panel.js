// Custom module for Zynthian CUIA Switch Open Stage Control Template
var sw_zyn_host = '192.168.88.102'
var sw_zyn_port = '1370'

// Time references
let time_start = 0;
const short = 0.3 * 1000; // 0.3 seconds
const long = 2 * 1000;    // 2 seconds
const switches = loadJSON('./switch.json');
let alt_swt = false; 

function switch_alt() {
	if (alt_swt){
		receive("/alt", 1);
	} else {
		receive("/alt", 0);
	}
}

function countTimer(switch_number) {
    let time_end = Date.now();
	var sw_address;
	var sw_arg;
	var sw_values;
    
    // If the start time is not set, set it and exit the function
    if (time_start === 0) {
        time_start = time_end;
        return;
    }
	
	// Calculate button press duration
    let push_length = time_end - time_start;
	time_start = 0
	
	const cuia_switch = switches.find(item => item.Switch === Number(switch_number.value));
	

    if (push_length < short) {
        // Time is shorter than short.
		
		if (alt_swt){
			sw_values = cuia_switch.AltShort;
		} else {
			sw_values = cuia_switch.Short;
		}

    } else if (push_length >= short && push_length <= long) {
        // Time is between short and long.
		
		if (alt_swt){
			sw_values = cuia_switch.AltBold;
		} else {
			sw_values = cuia_switch.Bold;	
		}
		
    } else {
        // Time is longer than long	
		
		if (alt_swt){
			sw_values = cuia_switch.AltLong;
		} else {
			sw_values = cuia_switch.Long;
		}
    }
	
	// Send message
	[sw_address, sw_arg] = sw_values.split(" ")
	if (typeof sw_address !== "undefined"){
		if (typeof sw_arg !== "undefined") {
			if (sw_arg.includes(",")){
				const sw_arguments = sw_arg.split(",")
				send(sw_zyn_host, sw_zyn_port, sw_address, Number(sw_arguments[0]), sw_arguments[1]) 
			} else {
				send(sw_zyn_host, sw_zyn_port, sw_address, Number(sw_arg))
			}
		} else {
			send(sw_zyn_host, sw_zyn_port, sw_address)
		}
	}
}

module.exports = {

    init: function(){
        // This will be executed once when the OSC server starts after
        // connections are set up
        // It is called for the main module only
		switch_alt();
    },

    stop: function(){
        // This will be executed once when the OSC server stops
        // It is called for the main module only
    },

    reload: function(){
        // This will be executed after the custom module is reloaded
        // It is called for the main module only
		switch_alt();
    },

    oscInFilter:function(data){
        // Filter incoming OSC messages

        var {address, args, host, port} = data

        // Do what you want

        // address = string
        // args = array of {value, type} objects
        // host = string
        // port = integer

        // Return data if you want the message to be processed
        return {address, args, host, port}

    },

    oscOutFilter:function(data){
        // Filter outgoing OSC messages

        var {address, args, host, port, clientId} = data
		
		//console.log('address out filter', address)
		
		if (address === '/alt') {
			if (alt_swt){
				alt_swt = false
			} else {
				alt_swt = true
			}
			time_start = 0
			return
		}
		
        if (address === '/switch') {
			//console.log('in out filter')
			countTimer(args[0])
			return
		}

        // Return data if you want the message to be sent
        return {address, args, host, port}
    },

    unload: function(){
        // This will be executed before the custom module is reloaded
        // It is called for all modules, including other loaded modules
    },

}
