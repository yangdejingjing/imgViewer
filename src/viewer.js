function Viewer(imgUrl, options) {
	this.scale = 1;
	this.options = {
		step: 0.5,
		max: 10,
		...options,
	};

	var _createMark = function () {
		var markDiv = document.createElement("div");
		markDiv.classList.add("viewer-mark");

		document.body.appendChild(markDiv);

		return markDiv;
	};

	var _createContainer = function (parent) {
		var container = document.createElement("div");
		container.classList.add("viewer-container");
		parent.appendChild(container);

		return container;
	};

	var _createImgContainer = function (parent) {
		var container = document.createElement("div");
		container.classList.add("viewer-img_container");
		parent.appendChild(container);

		return container;
	};

	var _createLoading = function (parent) {
		var loading = document.createElement("div");
		loading.classList.add("lds-spinner");
		loading.innerHTML = "<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>";

		parent.appendChild(loading);

		return loading;
	};

	var _createImage = function (parent) {
		var loading = _createLoading(parent);

		var img = new Image();
		img.classList.add("viewer-img");
		img.onload = function () {
			var _$ = this.width / this.height;
			var w, h;

			w = this.width;
			h = this.height;

			if (this.width > this.height && this.width > window.innerWidth) {
				w = window.innerWidth;
				h = w / _$;

				if (h > window.innerHeight) {
					h = window.innerHeight;
					w = h * _$;
				}
			}

			if (this.height > this.width && this.height > window.innerHeight) {
				h = window.innerHeight;
				w = h * _$;

				if (w > window.innerWidth) {
					w = window.innerWidth;
					h = w / _$;
				}
			}

			img.width = w;
			img.height = h;

			parent.appendChild(img);

			_removeElement(loading);
		};

		img.src = self.url;
		// parent.appendChild(img);
		return img;
	};

	var _createClose = function (parent) {
		var closeBtn = document.createElement("button");
		closeBtn.classList.add("viewer-close");
		closeBtn.innerText = "关闭";
		parent.appendChild(closeBtn);
		closeBtn.onclick = function () {
			if (mark) {
				mark.remove();
			}
		};
		return closeBtn;
	};

	var _removeElement = function (el) {
		el.remove();
	};

	var _createRangeBar = function (parent, max, _this) {
		var input = document.createElement("input");
		input.type = "range";
		input.value = "1";
		input.max = max;
		input.min = "1";
		input.classList.add("viewer-rangebar");
		input.onchange = function (e) {
			_this.scale = Number(e.srcElement.value);
			img.style.transform = "scale(" + _this.scale + ")";
		};

		parent.appendChild(input);
	};

	this.url = imgUrl;
	var self = this;
	var mark = _createMark();
	var container = _createContainer(mark);
	var imgContainer = _createImgContainer(container);
	var img = _createImage(imgContainer);
	_createClose(mark);
	_createRangeBar(mark, this.options.max, this);
	var hasMove = false;
	var hasDown = false;
	var ox, oy;
	var tx = 0,
		ty = 0;

	var mousedownTimeStamp, lastmouseupTimeStamp;
	var clickTimer;

	img.onmousedown = function (e) {
		e.preventDefault();
		e.stopPropagation();

		mousedownTimeStamp = e.timeStamp;
		hasDown = true;
		ox = e.clientX;
		oy = e.clientY;
	};

	img.onmousemove = function (e) {
		e.preventDefault();
		e.stopPropagation();

		if (clickTimer) {
			clearTimeout(clickTimer);
			clickTimer = null;
		}

		hasMove = true;

		if (hasDown) {
			var _ox = e.clientX - ox;
			var _oy = e.clientY - oy;

			ox = e.clientX;
			oy = e.clientY;

			tx += _ox;
			ty += _oy;

			container.style.left = tx + "px";
			container.style.top = ty + "px";
		}
	};

	img.onmouseup = function (e) {
		hasMove = false;
		hasDown = false;
		var _lstTimeStamp = lastmouseupTimeStamp;
		lastmouseupTimeStamp = e.timeStamp;

		// 判断长按
		if (e.timeStamp - mousedownTimeStamp > 500) {
			console.log("3");
			return;
		}

		// 是双击
		if (e.timeStamp - _lstTimeStamp <= 200) {
			if (clickTimer) {
				clearTimeout(clickTimer);
			}

			container.style.top = "0px";
			container.style.left = "0px";
			tx = 0;
			ty = 0;
			self.scale = 1;

			img.style.transform = "none";
			img.style.transformOrigin = "50% 50%";
			return;
		}

		// 单机
		clickTimer = setTimeout(() => {
			self.scale += self.options.step;
			img.style.transformOrigin = e.offsetX + "px " + e.offsetY + "px";
			img.style.transform = "scale(" + self.scale + ")";
		}, 200);
	};

	img.onmouseout = function (e) {
		hasMove = false;
		hasDown = false;
	};

	img.onclick = function (e) {};

	this.close = function () {
		_removeElement(mark);
	};
}
