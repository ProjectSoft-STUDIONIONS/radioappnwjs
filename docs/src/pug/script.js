/**
https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css
https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.min.js
https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js
**/
function loadScript(src, callback)
{
	var s,
		t;
	s = document.createElement('script');
	s.type = 'text/javascript';
	s.src = src;
	s.onload = s.onreadystatechange = function() {
		if ( (!this.readyState || this.readyState == 'complete') )
		{
			if(typeof callback == "function")
				callback();
		}
	};
	t = document.getElementsByTagName('body')[0];
	t.appendChild(s);
}
function loadCss(src, callback)
{
	var s,
		t;
	s = document.createElement('link');
	s.rel = 'stylesheet';
	s.href = src;
	s.onload = s.onreadystatechange = function() {
		if ((!this.readyState || this.readyState == 'complete') )
		{
			if(typeof callback == "function")
				callback();
		}
	};
	t = document.getElementsByTagName('body')[0];
	t.appendChild(s);
}
loadCss("https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css")
loadScript("https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.min.js", function(){
	loadScript("https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js", function(){
		console.log("load");
	})
})