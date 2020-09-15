(function($){
	/*jshint expr:true */
	/*jshint multistr: true */
	var defaultCallBack = {
		yes: {
			text: "ОК",
			class: '',
			callback: function() {
				$.psmodal.close();
				return !0;
			}
		},
		no: {
			text: "ОТМЕНА",
			class: '',
			callback: function() {
				$.psmodal.close();
				return !0;
			}
		}
	},
	ico = '\
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">\
<g><path d="M990,39.9L960.1,10L500,470.1L39.9,10L10,39.9L470.1,500L10,960.1L39.9,990L500,529.9L960.1,990l29.9-29.9L529.9,500L990,39.9z"/></g>\
</svg>',
	tpl = $(
'<div class="psmodal--custom">\
	<div class="psmodal--custom---overlay"></div>\
	<div class="psmodal--custom---modal">\
		<div class="psmodal--custom---modal---wrapper">\
			<div class="psmodal--custom---modal-header">\
				<span class="psmodal--custom---modal-header--title"></span>\
				<button class="psmodal--custom--close">' + ico + '</button>\
			</div>\
			<div class="psmodal--custom---modal-main">\
				<div class="psmodal--custom---modal-main--content">\
					<i class="psmodal--custom--icon"></i>\
					<div class="psmodal--custom---modal-main--content-wrapper">\
						\
					</div>\
				</div>\
				<div class="psmodal--custom---modal-main--btns"></div>\
			</div>\
		</div>\
	</div>\
</div>'
	),
	mergeOpts = function(opts1, opts2) {
		var rez = $.extend(true, {}, opts1, opts2);
		$.each(opts2, function(key, value) {
			if ($.isArray(value)) {
				rez[key] = value;
			}
		});
		return rez;
	},
	PsModal = function(type, message, title, callback){
		message = $.type(message) === 'string' ? message : ($.isPlainObject(message) ? message.toString() : message);
		var yes = defaultCallBack.yes,
			no = defaultCallBack.no;
		if($.isPlainObject(callback)){
			yes = $.isPlainObject(callback.yes) ? mergeOpts(defaultCallBack.yes, callback.yes) : defaultCallBack.yes;
			no = $.isPlainObject(callback.no) ? mergeOpts(defaultCallBack.no, callback.no) : null;
		}
		type = (type=='alert' || type=='confirm' || type=='prompt') ? type : 'modal';
		this.type = type;
		this.message = message;
		this.title = title;
		this.callback = {
			yes: yes,
			no: no
		};
		this.modal = tpl.clone().attr({
			id: "psmodal--custom"
		});
		this.modal.addClass(this.type);
		$(".psmodal--custom---modal-header--title", this.modal).text(this.title);
		$(".psmodal--custom---modal-main--content-wrapper", this.modal).append(this.message);

		var okBtn = $("<button></button>", {
			class: "psmodal--custom-btn ok",
			text: this.callback.yes.text
		}).on('click', function(e){
			$.psmodal.modal.callbackOk.call($.psmodal.modal, e);
		}).addClass(this.callback.yes.class);
		$('.psmodal--custom---modal-main--btns', this.modal).append(okBtn);
		if(this.callback.no){
			var noBtn = $("<button></button>", {
				class: "psmodal--custom-btn cancel",
				text: this.callback.no.text
			}).on('click', function(e){
				$.psmodal.modal.callbackNo.call($.psmodal.modal, e);
			}).addClass(this.callback.no.class);
			$('.psmodal--custom---modal-main--btns', this.modal).append(noBtn);
		}
		$('.psmodal--custom--close', this.modal).on('click', function(e){
			$.psmodal.modal.callbackNo.call($.psmodal.modal, e);
		});
		$("body").append(this.modal).addClass('open--modal');;
		this.firstElement = $($('button', this.modal)[0]);
		var btns = $('.psmodal--custom-btn', this.modal);
		this.lastElement = $(btns[btns.length-1]);
		var self = this;
		setTimeout(
			function(){
				$('.psmodal--custom---modal', self.modal).scrollTop(0);
				$('.psmodal--custom--close', self.modal).focus();
			},
			10
		);
		return this;
	};
	$.extend(PsModal.prototype, {
		close: function(){
			if(this.modal){
				$("body").removeClass('open--modal');
				$('.psmodal--custom---modal-main--btns button', this.modal).unbind('click');
				$('.psmodal--custom--close', this.modal).unbind('click');
				this.modal.remove();
				this.modal.empty();
				this.modal = null;
			}
		},
		callbackOk: function(e){
			if($.psmodal.modal.callback.yes.callback.call(this.modal, e)){
				$.psmodal.close();
			}
		},
		callbackNo: function(e){
			if($.psmodal.modal.callback.no) {
				$.psmodal.modal.callback.no.callback.call(this.modal, e);
			}else{
				$.psmodal.close();
			}

		}
	});
	$.psmodal = {
		keydown: function(e){
			if(e.keyCode == 9) {
				if($.psmodal.modal)
					!e.shiftKey ? $.psmodal.modal.firstElement.focus() : $.psmodal.modal.lastElement.focus();
				return !1;
			}
		},
		open: function(type, message, title, callback) {
			$("body").addClass('open--modal');
			var self = this,
				modal = new PsModal(type, message, title, callback);
			this.modal = modal;

			this.modal.lastElement.on('keydown', function(e){
				if (e.keyCode == 9 && !e.shiftKey) {
					$.psmodal.modal.firstElement.focus();
					return !1;
				}
			});
			this.modal.firstElement.on('keydown', function(e){
				if (e.keyCode == 9 && e.shiftKey) {
					$.psmodal.modal.lastElement.focus();
					return !1;
				}
			});
			return modal.modal;
		},
		close: function(){
			$("body").removeClass('open--modal');
			this.modal && (
				this.modal.close(),
				this.modal = null
			);
			return this;
		}
	};
	$(document).on('keydown', function(e){
		if(e.keyCode == 27) {
			$.psmodal.close();
			$("body").removeClass('open--modal');
		}
	});
}(jQuery));
