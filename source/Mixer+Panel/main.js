var submodules = [
    require('./mixer.js'),
    require('./panel.js'),
    // etc
]


module.exports = {
    init: function(){
        for (var m of submodules) {
            if (m.init) m.init()
        }
    },
	stop: function(){
        for (var m of submodules) {
            if (m.init) m.init()
        }
    },
    reload: function(){
        for (var m of submodules) {
            if (m.reload) m.reload()
        }
    },
    oscInFilter: function(data){

        for (var m of submodules) {
            if (m.oscInFilter) data = m.oscInFilter(data)
            if (!data) return
        }

        return data

    },
    oscOutFilter: function(data){

        for (var m of submodules) {
            if (m.oscOutFilter) data = m.oscOutFilter(data)
            if (!data) return
        }

        return data
    },
	unload: function(){
        for (var m of submodules) {
            if (m.init) m.init()
        }
    }
}