

function JSObjectGet(JSObject, keyName, defaultValue = null) {
	return JSObject[keyName] ?? defaultValue;
}

class Parsers {

	static GetFromAction(sourceString) {
		var res = {}

		var bodyParts = sourceString.split('@', 2)
		
		if (bodyParts.length > 0) {
			
			res.url = bodyParts[1];

			var headParts = bodyParts[0].replace(" ", "").split(':', 2)

			if (headParts.length > 0) {

				res.method = headParts[0];
				res.async = String(headParts[1]) === "true";

			}

		}

		return res;

	}

	static GetHTMLElementsFrom(targets) {

		var res = []
		var splitedSources = targets.split(" ")
		
		for (var identifierSource of splitedSources) {

			if (identifierSource.length < 1)
				continue;

			const elements = document.querySelectorAll(identifierSource);

			for (const element of elements)
				res.push(element);

		}

		return res;

	}

}

class Requisitions {

	static Make(objRes, doneCallback) {

		var req = new XMLHttpRequest();

		req.open(
			JSObjectGet(objRes, "method", ""),
			JSObjectGet(objRes, "url", ""),
			JSObjectGet(objRes, "async", false)
		)
		req.onload = () => {
			doneCallback(req);
		};
		req.send();

	}

}

class Environment {

	static HTTP_ACTIONS = {
		"post"		: 0,
		"get"		: 1,
		"put"		: 2,
		"head"		: 3,
		"delete"	: 4,
		"connect"	: 5,
		"options"	: 6,
		"trace"		: 7,
		"patch"		: 8,
	};

	static GRANOLA_ATTRIBUTES = {
		ATTR_GRANOLA_ELEMENT: "granola",
		ATTR_GRANOLA_ACTION: "action",
		ATTR_GRANOLA_ACTION_JS_REST_KEY_PAIRS: "js-rest-key",
		ATTR_GRANOLA_TARGETS: "targets",
		ATTR_GRANOLA_SWAP: "swap",
		ATTR_GRANOLA_AUTO: "auto",
	}

	AllHTMLComponents = Array[HTMLElement];

	ElementRun(componentTarget) {
		
		if (componentTarget.hasAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_ACTION)) {
			let parsedStringCommand = componentTarget.getAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_ACTION).split(":");

			if (parsedStringCommand.length > 0) {
				if (parsedStringCommand[0] in Environment.HTTP_ACTIONS) {
					Requisitions.Make(
						Parsers.GetFromAction(
							componentTarget.getAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_ACTION)), (res) => this.RequisitionFinalized(res, componentTarget))
				}
			}
		}
	}

	RequisitionFinalized(response, componentTarget) {
		var targets = [componentTarget]
		var swapResult = "innerHTML";

		if (componentTarget.hasAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_TARGETS))
			targets = Parsers.GetHTMLElementsFrom(componentTarget.getAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_TARGETS))
		
		if (componentTarget.hasAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_SWAP))
			if (componentTarget.getAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_SWAP).length > 0)
				swapResult = componentTarget.getAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_SWAP)

		if (componentTarget.hasAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_ACTION_JS_REST_KEY_PAIRS)) {

			if (componentTarget.getAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_ACTION_JS_REST_KEY_PAIRS).length > 0) {
				var stringAsJS = JSON.parse(response.responseText);
				var items = componentTarget.getAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_ACTION_JS_REST_KEY_PAIRS).split(";");
				
				var itemIndex = 0;

				for (const target of targets) {
					var item = items[itemIndex];

					if (item.length < 1)
						continue;
					
					var paths = item.split("/");
					var value = stringAsJS;

					for (const path of paths) {
						value = value[path]
					}

					target[swapResult] = value;

					if (itemIndex + 1 < items.length)
						itemIndex++;
				}

			}

		}

		else {
			for (const element of targets)
				element[swapResult] = res.responseXML;
		}
	}

	Get() {
		this.AllHTMLComponents = document.body.querySelectorAll(`[${Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_ELEMENT}]`);

		for (let CP of this.AllHTMLComponents) {

			if (CP.getAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_ELEMENT) == "false")
				continue;

			if (CP.hasAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_AUTO)) {
				if (CP.getAttribute(Environment.GRANOLA_ATTRIBUTES.ATTR_GRANOLA_AUTO) != "false") {
					this.ElementRun(CP);
				}
			}

			if (HTMLButtonElement.prototype.isPrototypeOf(CP)) {
				CP.onclick = () => {
					this.ElementRun(CP);
				}
			}

		}

	}

}

function MainStartup() {

	var defaultEnv = new Environment;
	defaultEnv.Get();

}

window.onload = MainStartup();