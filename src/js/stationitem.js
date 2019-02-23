/*(function(){
	var css = "";
	const agent = [];
	try {
		css = fs.readFileSync("assets/css/stationitem.css", "utf8");
		let arr = css.split("}");
		arr.forEach(function(item, index, ars){
			if(item.length){
				agent.push(item + "}");
			}
		});
	}catch(e){}
	class StationItem extends HTMLElement {
		
		static get observedAttributes() {
			return ['id', 'name', 'stream', 'logo', 'play', 'select', 'buffering'];
		}
		
		constructor(...args) {
			super();
			const shadow = this.attachShadow({mode: 'open'}),
					wrapper = document.createElement('div'),
					icon = document.createElement('div'),
					text = document.createElement('div'),
					handle = document.createElement('div'),
					logo = document.createElement('img'),
					iconw = document.createElement('div'),
					style = document.createElement('style');
			logo.src = 'favicon.png';
			style.appendChild(document.createTextNode(""));
			wrapper.setAttribute('class', 'station-item');
			icon.setAttribute('class', 'station-item-icon');
			logo.setAttribute('class', 'station-item-icon-logo');
			text.setAttribute('class', 'station-item-text');
			text.setAttribute('id', 'station-item-text');
			handle.setAttribute('class', 'station-item-handle');
			shadow.appendChild(style);
			shadow.appendChild(wrapper);
			wrapper.appendChild(icon);
			wrapper.appendChild(text);
			wrapper.appendChild(handle);
			icon.appendChild(logo);
			text.appendChild(document.createTextNode('Новая станция TEST'));
			this.classList.add('station-test');
			return this;
		}
		
		connectedCallback() {
			const shadow = this.shadowRoot,
					style = shadow.querySelector('style'),
					sheet = style.sheet;
			// Clear style
			if(sheet && sheet.cssRules.length)
				while(sheet.cssRules.length){
					sheet.deleteRule(0);
				}
			agent.forEach(function(item){
				sheet.insertRule(item, sheet.cssRules.length);
			});
		}
		
		disconnectedCallback() {
			//console.log('Custom square element removed from page.');
		}
		
		adoptedCallback() {
			//console.log('Custom square element moved to new page.');
		}
		
		attributeChangedCallback(name, oldValue, newValue) {
			console.log(name, oldValue, newValue);
			const shadow = this.shadowRoot;
		}
		
		get logo(){
			const shadow = this.shadowRoot;
			if(shadow.logo){
				return shadow.logo;
			}
			if(this.hasAttribute('logo')){
				shadow.logo = this.getAttribute('logo');
			}else{
				shadow.logo = '/assets/images/favicon.png';
			}
			return shadow.logo;
		}
		
		set logo(val){
			const shadow = this.shadowRoot,
					logo = shadow.querySelector('img');
			if(typeof val === 'string'){
				shadow.logo = val;
				logo.src = val;
			}else{
				throw new Error('Должен быть String');
			}
		}
	}
	
	customElements.define('station-item', StationItem);
	window.StationItem = StationItem;
	
}());
*/