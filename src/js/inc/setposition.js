(function(window){
	window.setDefaultPosition = function(){
		nw.Screen.Init();
		var w = 400,
			h = 500,
			state = (localStorage.getItem('canvas_state') == "true");
		w = state ? 600 : 400;
		const win = nw.Window.get();
		let screen = nw.Screen.screens[0],
			x = parseInt(screen.bounds.x + (screen.bounds.width - w) / 2) || 0,
			y = parseInt(screen.bounds.y + (screen.bounds.height - 500) / 2) || 0;
		win.moveTo(x, y);
		win.resizeTo(w, 500);
		win.setMinimumSize(w, 500);
	}
}(window));
