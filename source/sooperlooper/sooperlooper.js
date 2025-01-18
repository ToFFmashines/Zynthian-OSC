// Inicializace proměnných
// na playeru PS
//const SOOPERLOOPER_HOST = "192.168.88.107"; 		// IP adresa SooperLooper
//const SOOPERLOOPER_PORT = 9951;       				// Výchozí OSC port SooperLooper
// na zynthianu
const SOOPERLOOPER_HOST = "192.168.88.102"; 		// IP adresa SooperLooper
const SOOPERLOOPER_PORT = 9951;       				// Výchozí OSC port SooperLooper
const OSC_LOCAL_HOST = "192.168.88.105"; 			// IP adresa Open Stage Control Client
const OSC_LOCAL_PORT = 8088;       					// Výchozí OSC port Open Stage Control Client
const OSC_LOCAL = OSC_LOCAL_HOST + ":" + OSC_LOCAL_PORT 	// Celá Adresa Open Stage Control Client

// Proměnné pro kontrolu počtu smyček
// aktualní počet smyček
// předchozí počet smyček
let NUMBER_OF_LOOPS = 0;
let NUMBER_OF_LOOPS_OLD = 0;

const GLOBAL_VARIABLES = [ 
    "tempo",
    "eighth_per_cycle",
    "dry",
    "wet",
    "input_gain",
    "sync_source",
    "tap_tempo",
    // "save_loop", //not used
    "auto_disable_latency",
    "select_next_loop",
    "select_prev_loop",
    // "select_all_loops", //not used
    "selected_loop_num",
    "output_midi_clock",
    "smart_eighths",
  ];
  
const GLOBAL_VARIABLES_AUTUPDATE = [ 
	"in_peak_meter",
	"out_peak_meter",
	"global_cycle_len",
	"global_cycle_pos"
  ];
  
const LOOP_VARIABLES = [
  "rec_thresh",
  "feedback",
  "dry",
  "wet",
  "input_gain",
  "rate",
  "scratch_pos",
  "delay_trigger",
  "quantize",
  "round",
  "redo_is_tap",
  "sync",
  "playback_sync",
  "use_rate",
  "fade_samples",
  "use_feedback_play",
  "use_common_ins",
  "use_common_outs",
  "relative_sync",
  "use_safety_feedback",
  "pan_1",
  "pan_2",
  "pan_3",
  "pan_4",
  "input_latency",
  "output_latency",
  "trigger_latency",
  "autoset_latency",
  "mute_quantized",
  "overdub_quantized",
  "discrete_prefader",
  "state",
  "next_state",
  "loop_len",
  "loop_pos",
  "cycle_len",
  "free_time",
  "total_time",
  "rate_output",
  "in_peak_meter",
  "out_peak_meter",
  "is_soloed"
]
  
function pingSooperLooper() {
  console.log("Sending ping to SooperLooper...");
  send(SOOPERLOOPER_HOST, SOOPERLOOPER_PORT, "/ping", OSC_LOCAL, "/pingack");
}

function registerSooperLooper() {
  console.log("Sending register request of number loops to SooperLooper...");
  send(SOOPERLOOPER_HOST, SOOPERLOOPER_PORT, "/register", OSC_LOCAL, "/pingack");
}

function loopsSooperLooper(args) {
  console.log("SooperLopeer ma celkem ", args[2].value , "smycku/smycky");
  NUMBER_OF_LOOPS_OLD = NUMBER_OF_LOOPS;
  NUMBER_OF_LOOPS = args[2].value;
  return ["/global/loops", args[2].value]; 
}

// funkce pro GLOBAL PARAMETERS ze SooperLooper
// registrace globalních proměnnych i s autoupdate
function registerGlobalVariables() {
	console.log("Sending reqvest to SooperLooper for registration ...");
	for (const value of GLOBAL_VARIABLES) {
		console.log(`${value}`);
		send(SOOPERLOOPER_HOST, SOOPERLOOPER_PORT, "/register_update", value, OSC_LOCAL, "/global");
	}
	console.log("and for autoupdate registration ...");
	for (const value of GLOBAL_VARIABLES_AUTUPDATE) {
		console.log(`${value}`);
		send(SOOPERLOOPER_HOST, SOOPERLOOPER_PORT, "/register_auto_update", value, 100, OSC_LOCAL, "/global");
	}
}
// funkce pro získání aktuálních hodnot globálních promměnnych
// /get  s:param  s:return_url  s:retpath
function getGlobalVariables() {
	console.log("Sending get command to SooperLooper for gettin global variables ...");
	for (const value of GLOBAL_VARIABLES) {
		console.log(`${value}`);
		send(SOOPERLOOPER_HOST, SOOPERLOOPER_PORT, "/get", value, OSC_LOCAL, "/global");
	}
}

// převod globálních hodnot mezi --> SooperLooper a šablonou
function globalValues(args) {
	// console.log(args[1].value, " je rovno ", args[2].value );
	// vyjímka pro tap_tempo
	// kontrola zda je o tap_tempo
	if(args[1].value ==='tap_tempo'){
		args[2].value = 1;   // hodnota jedna proto aby blikal button_tap_tempo
	} 
	console.log(args[1].value, " je rovno ", args[2].value );
	return ["/global/" + args[1].value, args[2].value]; 
}

// převod globálních hodnot mezi šablonou --> SooperLooper 
function globalOut(address, args) {
	// Posunutí hodnot o jeden index a vložení nové hodnoty
	var newargs = [{type: 's', value: address.replace("/global/", "")}];
	// vyjímka pro tap_tempo
	// kontrola zda je o tap_tempo
	// tap_tempo by mělo být přepočítáno na tempo a to posláno... 
	if(newargs[0].value ==='tap_tempo'){
		newargs[1] = [{type: 'f', value: Date.now()}]
	} else {
		newargs[1] = args[0];	
	}
	//console.log("Poslu /set s argumenty ", newargs );
	return ["/set", newargs]; 
}

// ---- Funkce pro smyčky -----

// získání hodnot pro konkrétní smyčku 

function getValuesOfLoopNo(loopNumber) {
	const address = "/sl/" + loopNumber + "/get";
	console.log("Sending ", address, " to SooperLooper");
	for (const value of LOOP_VARIABLES) {
		console.log(`${value}`);
		send(SOOPERLOOPER_HOST, SOOPERLOOPER_PORT, address, value, OSC_LOCAL, "/loop/get");
	}
}

// registrace proměných k získání hodnot pro konkrétní smyčku
function registerLoopNo(loopNumber) {
	console.log("Sending /register_update to SooperLooper for registration Loop No.", loopNumber, " ...");
	const address = "/sl/" + loopNumber + "/register_update";
	for (const value of LOOP_VARIABLES) {
		console.log(`${value}`);
		send(SOOPERLOOPER_HOST, SOOPERLOOPER_PORT, address, value, OSC_LOCAL, "/loop/get");
	}
}

// registrace proměných k automaticky opakovanému získání hodnot pro konkrétní smyčku
function registerAutoLoopNo(loopNumber) {
	console.log("Sending /register_auto_update to SooperLooper for registration Loop No.", loopNumber, " ...");
	const address = "/sl/" + loopNumber + "/register_auto_update";
	for (const value of LOOP_VARIABLES) {
		console.log(`${value}`);
		send(SOOPERLOOPER_HOST, SOOPERLOOPER_PORT, address, value, 100, OSC_LOCAL, "/loop/get/auto");
	}
}

// převod hodnot ze SooperLooper --> šablona
function loopValues(args) {
	//i:loop#  s:ctrl  f:control_value
	console.log("Smyčka č. ", args[0].value, "Proměnna  ", args[1].value, " je rovna ", args[2].value );
	const index = args[0].value + 1;
	const address = "/sl/" + index + "/" + args[1].value;
	return [address, args[2].value]; 
}

// převod hodnot ze šablony --> SooperLooper
function setloopValues(address, args) {
	//  /sl/#/set  s:control  f:value
	const parts = address.split('/').filter(part => part)
	// console.log("Smyčka č. ", args[0].value, "Proměnna  ", args[1].value, " je rovna ", args[2].value );
	const index = parts[1] - 1;
	const newaddress = "/sl/" + index + '/set';
	const newargs = [{type: 's', value: parts[2]}, args[0]];
	return [newaddress, newargs]; 
}

module.exports = {

    init: function(){
        // this will be executed once when the osc server starts after
        // connections are set up
        // it is called for the main module only
        
        console.log("Initializing connection with SooperLooper...");
        
		// zjištění aktualního počtu smyček
        pingSooperLooper();
        
        // a registrace změny počtu smyček 
		registerSooperLooper();
		
		// požadavek na poslání hodnot všech globalních proměnnych
		getGlobalVariables();
		
		// požadavek na získání hodnot pro smyčku 1
		getValuesOfLoopNo(0);
		
		// register hodnot pro smyčku 1
		registerLoopNo(0);
		
		// auto register hodnot pro smyčku 1
		registerAutoLoopNo(0)
		
        
    },

    stop: function(){
        // this will be executed once when the osc server stops
        // it is called for the main module only
    },

    reload: function(){
        // this will be executed after the custom module is reloaded
        // it is called for the main module only
        
        // zjištění aktualního počtu smyček
        pingSooperLooper();
        
        // a registrace změny počtu smyček 
		registerSooperLooper();
		
		// požadavek na poslání hodnot všech globalních proměnnych
		getGlobalVariables();
		
		// požadavek na získání hodnot pro smyčku 1
		getValuesOfLoopNo(0);
		
		// register hodnot pro smy?ku 1
		registerLoopNo(0);
		
		// auto register hodnot pro smy?ku 1
		registerAutoLoopNo(0)
		
    },

    oscInFilter:function(data){
        // Filter incoming osc messages

        var {address, args, host, port} = data

        // do what you want

        // address = string
        // args = array of {value, type} objects
        // host = string
        // port = integer
        
		if (address.startsWith("/global")) {
			[address, args] = globalValues(args);
	
		}
		
		if (address.startsWith("/loop/get")) {
			console.log("IN adrress je  ", address, "argumenty ", args );
			[address, args] = loopValues(args);
		}
		
		// funkce pro registraci změn v počtu smyček
		if (address === "/pingack") {
			[address, args] = loopsSooperLooper(args);
		}
		

        // return data if you want the message to be processed
        return {address, args, host, port}

    },

    oscOutFilter:function(data){
        // Filter outgoing osc messages

        var {address, args, host, port, clientId} = data;

        if (address.startsWith("/global")) {
			[address, args] = globalOut(address, args);
			console.log("OUTPUT adrress je  ", address, "argumenty ", args );			
		}
		if (address.startsWith("/sl/")) {
			[address, args] = setloopValues(address, args);
			console.log("OUTPUT adrress je  ", address, "argumenty ", args );			
		}
		
		// přidání smyčky
		if (address.startsWith("/add_loop")) {
			address = "/loop_add";
			args = [{type:'i', value: 2 }, {type:'f', value: 43.69 }];			
		}
		
        // return data if you want the message to be and sent
        return {address, args, host, port};
    },

    unload: function(){
        // this will be executed before the custom module is reloaded
        // it is called for all modules, including other loaded modules
    },

}
