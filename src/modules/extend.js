function extend() {
	var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false,
		toString = Object.prototype.toString,
		hasOwn = Object.prototype.hasOwnProperty,
		class2type = {
			"[object Boolean]": "boolean",
			"[object Number]": "number",
			"[object String]": "string",
			"[object Function]": "function",
			"[object Array]": "array",
			"[object Date]": "date",
			"[object RegExp]": "regexp",
			"[object Object]": "object"
		},
		jq = {
			isFunction: function (obj) {
				return jq.type(obj) === "function";
			},
			isArray: Array.isArray || function (obj) {
				return jq.type(obj) === "array";
			},
			isWindow: function (obj) {
				return obj != null && obj == obj.window;
			},
			isNumeric: function (obj) {
				return !isNaN(parseFloat(obj)) && isFinite(obj);
			},
			type: function (obj) {
				return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
			},
			isPlainObject: function (obj) {
				if (!obj || jq.type(obj) !== "object" || obj.nodeType) {
					return false;
				}
				try {
					if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
						return false;
					}
				} catch (e) {
					return false;
				}
				var key;
				for (key in obj) {}
				return key === undefined || hasOwn.call(obj, key);
			}
		};
	if (typeof target === "boolean") {
		deep = target;
		target = arguments[1] || {};
		i = 2;
	}
	if (typeof target !== "object" && !jq.isFunction(target)) {
		target = {};
	}
	if (length === i) {
		target = this;
		--i;
	}
	for (i; i < length; i++) {
		if ((options = arguments[i]) != null) {
			for (name in options) {
				src = target[name];
				copy = options[name];
				if (target === copy) {
					continue;
				}
				if (deep && copy && (jq.isPlainObject(copy) || (copyIsArray = jq.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && jq.isArray(src) ? src : [];
					} else {
						clone = src && jq.isPlainObject(src) ? src : {};
					}
					// WARNING: RECURSION
					target[name] = extend(deep, clone, copy);
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}
	return target;
};
module.exports = extend;