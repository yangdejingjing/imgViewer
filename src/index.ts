import { ViewerOptions } from "types";

export default class Viewer {
	scale: number = 1;
	options: ViewerOptions;
	url: string;
	mark: HTMLElement;
	img: HTMLImageElement;
	container: HTMLDivElement;
	imgContainer: HTMLDivElement;

	constructor(imgUrl: string, options: ViewerOptions) {
		this.url = imgUrl
		this.options = {
			step: 0.5,
			max: 10,
			...options
		}
		this.mark = this._createMark();
		this.container = this._createContainer(this.mark);
		this.imgContainer = this._createImgContainer(this.container);
		this.img = this._createImage(this.imgContainer, this.url);
		this._createClose(this.mark);
		this._createRangeBar(this.mark, this.options.max);
		var hasMove = false;
		var hasDown = false;
		var ox: any, oy: any;
		var tx = 0,
			ty = 0;

		var mousedownTimeStamp: number, lastmouseupTimeStamp: number;
		var clickTimer: any;

		this.img.onmousedown = function (e) {
			e.preventDefault();
			e.stopPropagation();

			mousedownTimeStamp = e.timeStamp;
			hasDown = true;
			ox = e.clientX;
			oy = e.clientY;
		};

		this.img.onmousemove = (e) => {
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

				this.container.style.left = tx + "px";
				this.container.style.top = ty + "px";
			}
		};

		this.img.onmouseup = (e) => {
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

				this.container.style.top = "0px";
				this.container.style.left = "0px";
				tx = 0;
				ty = 0;
				this.scale = 1;

				this.img.style.transform = "none";
				this.img.style.transformOrigin = "50% 50%";
				return;
			}

			// 单机
			clickTimer = setTimeout(() => {
				this.scale += this.options.step;
				this.img.style.transformOrigin = e.offsetX + "px " + e.offsetY + "px";
				this.img.style.transform = "scale(" + this.scale + ")";
			}, 200);
		};

		this.img.onmouseout = function (e) {
			hasMove = false;
			hasDown = false;
		};
	}

	private _createMark() {
		var markDiv = document.createElement("div");
		markDiv.classList.add("viewer-mark");

		document.body.appendChild(markDiv);

		return markDiv;
	};

	private _createContainer(parent: HTMLElement) {
		var container = document.createElement("div");
		container.classList.add("viewer-container");
		parent.appendChild(container);

		return container;
	};

	private _createImgContainer(parent: HTMLElement) {
		var container = document.createElement("div");
		container.classList.add("viewer-img_container");
		parent.appendChild(container);

		return container;
	};

	private _createLoading(parent: HTMLElement) {
		var loading = document.createElement("div");
		loading.classList.add("lds-spinner");
		loading.innerHTML = "<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>";

		parent.appendChild(loading);

		return loading;
	};

	private _createImage(parent: HTMLElement, url: string) {
		var loading = this._createLoading(parent);

		var img = new Image();
		img.classList.add("viewer-img");
		img.onload = (e: any) => {
			var _$ = e.width / e.height;
			var w, h;

			w = e.width;
			h = e.height;

			if (e.width > e.height && e.width > window.innerWidth) {
				w = window.innerWidth;
				h = w / _$;

				if (h > window.innerHeight) {
					h = window.innerHeight;
					w = h * _$;
				}
			}

			if (e.height > e.width && e.height > window.innerHeight) {
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

			this._removeElement(loading);
		};

		img.src = url;
		// parent.appendChild(img);
		return img;
	};

	private _createClose(parent: HTMLElement) {
		var closeBtn = document.createElement("button");
		closeBtn.classList.add("viewer-close");
		closeBtn.innerText = "关闭";
		parent.appendChild(closeBtn);
		closeBtn.onclick = () => {
			if (this.mark) {
				this.mark.remove();
			}
		};
		return closeBtn;
	};

	private _removeElement(el: HTMLElement) {
		el.remove();
	}

	private _createRangeBar(parent: HTMLElement, max: number) {
		var input = document.createElement("input");
		input.type = "range";
		input.value = "1";
		input.max = max + "";
		input.min = "1";
		input.classList.add("viewer-rangebar");
		input.onchange = (e) => {
			this.scale = Number((e.srcElement as any).value);
			this.img.style.transform = "scale(" + this.scale + ")";
		};

		parent.appendChild(input);
	};

	public close() {
		this._removeElement(this.mark);
	}
}