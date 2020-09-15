(function(){
	nw.Screen.Init();
	const win = nw.Window.get();
	let screen = nw.Screen.screens[0],
		x = parseInt(screen.bounds.x + (screen.bounds.width -400) / 2) || 0,
		y = parseInt(screen.bounds.y + (screen.bounds.height - 500) / 2) || 0;
	win.moveTo(x, y);
	win.resizeTo(400, 500);
}());
