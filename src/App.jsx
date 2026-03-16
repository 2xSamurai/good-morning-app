import { useEffect, useRef, useState } from "react";
import BtnCamera from "./components/BtnCamera";
import TextStyles from "./components/TextStyles";
import Header from "./components/Header";
import Step from "./components/Step";
import CameraShare from "./components/CameraShare";

function App() {
	const [image, setImage] = useState(null);
	const [activeStyle, setActiveStyle] = useState(0);
	const [text, setText] = useState("");
	const [textY, setTextY] = useState(null);
	const canvasRef = useRef(null);
	const boxRef = useRef(null);
	const isDragging = useRef(false);
	const dragOffset = useRef(0);
	const imageSizeRef = useRef({ width: 0, height: 0 });

	useEffect(() => {
		if (image || text) {
			console.log("image", image);
			drawCanvas(image, text);
		}
	}, [image, text, textY]);

	useEffect(() => {
		const canvas = canvasRef.current;

		const handleTouchStart = (e) => {
			if (!boxRef.current) return;
			const touchY = getCanvasY(e.touches[0].clientY);
			const box = boxRef.current;

			if (touchY >= box.y && touchY <= box.y + box.height) {
				isDragging.current = true;
				dragOffset.current = touchY - textY;
			}
		};

		const handleTouchMove = (e) => {
			if (!isDragging.current) return;

			const touchY = getCanvasY(e.touches[0].clientY);
			// setTextY(touchY - dragOffset.current);
			setTextY((prev) => {
				const min = boxRef.current.height / 2;
				// const max = img.height - boxRef.current.height / 2;
				const max =
					imageSizeRef.current.height - boxRef.current.height / 2;
				return Math.max(
					min,
					Math.min(max, touchY - dragOffset.current),
				);
			});
		};

		const handleTouchEnd = () => {
			isDragging.current = false;
		};

		const handleMouseDown = (e) => {
			console.log("handleMouseDown");
			const mouseY = getCanvasY(e.clientY);
			const box = boxRef.current;

			if (mouseY >= box.y && mouseY <= box.y + box.height) {
				isDragging.current = true;
				dragOffset.current = mouseY - textY;
			}
		};

		const handleMouseMove = (e) => {
			console.log("handleMouseMove");
			if (!isDragging.current) return;

			const mouseY = getCanvasY(e.clientY);
			setTextY(mouseY - dragOffset.current);
		};

		const handleMouseUp = () => {
			isDragging.current = false;
		};

		canvas.addEventListener("touchstart", handleTouchStart);
		canvas.addEventListener("touchmove", handleTouchMove);
		canvas.addEventListener("touchend", handleTouchEnd);

		canvas.addEventListener("mousedown", handleMouseDown);
		canvas.addEventListener("mousemove", handleMouseMove);
		canvas.addEventListener("mouseup", handleMouseUp);

		return () => {
			canvas.removeEventListener("touchstart", handleTouchStart);
			canvas.removeEventListener("touchmove", handleTouchMove);
			canvas.removeEventListener("touchend", handleTouchEnd);

			canvas.removeEventListener("mousedown", handleMouseDown);
			canvas.removeEventListener("mousemove", handleMouseMove);
			canvas.removeEventListener("mouseup", handleMouseUp);
		};
	}, []);

	function handleImagePick(e) {
		console.log("e", e);
		if (!e?.target?.files?.length) {
			return;
		}
		const file = e?.target?.files[0];

		const url = URL.createObjectURL(file);
		setImage(url);
	}

	const textPresets = [
		{
			title: "Good Morning",
			style: {
				textAlign: "center",
				textColor: "black",
				bgColor: "white",
			},
		},
	];

	const downloadImage = () => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		const img = new Image();
		img.src = image; // your selected image

		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;

			ctx.drawImage(img, 0, 0);
			ctx.font = textPresets[activeStyle]?.font;
			ctx.fillStyle = textPresets[activeStyle]?.textColor;
			ctx.textAlign = textPresets[activeStyle]?.textAlign;
			ctx.fillText(text, canvas.width / 2, canvas.height - 50);

			const link = document.createElement("a");
			link.download = "good-morning.png";
			link.href = canvas.toDataURL("image/png");
			link.click();
		};
	};

	const getCanvasY = (clientY) => {
		const rect = canvasRef.current.getBoundingClientRect();
		const scaleY = canvasRef.current.height / rect.height;
		return (clientY - rect.top) * scaleY;
	};

	const drawCanvas = (imgSrc) => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const img = new Image();
		const dpr = window.devicePixelRatio || 1;

		img.src = imgSrc;

		img.onload = () => {
			imageSizeRef.current = {
				width: img.width,
				height: img.height,
			};
			// High-DPI setup
			canvas.width = img.width * dpr;
			canvas.height = img.height * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			// Draw image
			ctx.clearRect(0, 0, img.width, img.height);
			ctx.drawImage(img, 0, 0);

			// ===== TEXT CONFIG =====
			const fontSize = img.width * 0.06; // tweak this
			const padding = fontSize * 0.4;
			const radius = fontSize * 0.4;

			ctx.font = `${fontSize}px sans-serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			const textValue = textPresets[activeStyle]?.title || "Good Morning";

			// Measure text
			const metrics = ctx.measureText(textValue);
			const textWidth = metrics.width;
			const textHeight = fontSize;

			// Position
			const x = img.width / 2;
			// const y = img.height - fontSize * 3.5;
			const y = textY;
			if (textY === null) {
				setTextY(img.height - fontSize * 3.5);
			}

			const boxWidth = textWidth + padding * 2;
			const boxHeight = textHeight + padding * 2;

			const boxX = x - boxWidth / 2;
			const boxY = y - boxHeight / 2;

			boxRef.current = {
				x: boxX,
				y: boxY,
				width: boxWidth,
				height: boxHeight,
			};

			// Background
			ctx.fillStyle = textPresets[activeStyle]?.style?.bgColor;
			drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, radius);
			ctx.fill();

			// Text
			// ctx.fillStyle = textPresets[activeStyle]?.style?.textColor;
			ctx.fillStyle = isDragging.current
				? "rgba(255,255,255,0.7)"
				: textPresets[activeStyle]?.style?.textColor;
			ctx.fillText(textValue, x, y);
		};
	};

	const drawRoundedRect = (ctx, x, y, width, height, radius) => {
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(
			x + width,
			y + height,
			x + width - radius,
			y + height,
		);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
	};

	const shareImage = async () => {
		const canvas = canvasRef.current;

		canvas.toBlob(async (blob) => {
			const file = new File([blob], "good-morning.png", {
				type: "image/png",
			});

			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				await navigator.share({
					files: [file],
					title: "Good Morning",
					text: "Good Morning 🌞",
				});
			} else {
				alert("Sharing not supported on this device");
			}
		});
	};

	return (
		<div className="main">
			<Header />
			<h1 style={{ textIndent: -9999999999, position: "absolute" }}>
				Good Morning App
			</h1>
			<div className={`ui-wrap ${image ? "d-none" : ""}`}>
				<div className="ui-wrap-inner">
					<div className="steps">
						<Step text1={"Tap The "} text2={"Button"} />
						<Step text1={"Take a "} text2={"Photo"} />
						<Step text1={"share on "} text2={"Whatsapp"} />
					</div>
					<label htmlFor="input-file">
						<BtnCamera />
					</label>
				</div>
				<TextStyles presets={textPresets} />
				<input
					id="input-file"
					className="input-file"
					type="file"
					accept="image/*"
					onChange={handleImagePick}
				/>
			</div>
			<div className={`ui-wrap-image ${image ? "" : "d-none"}`}>
				<div className="ui-wrap-image-container">
					<canvas
						ref={canvasRef}
						style={{ maxWidth: "100%", borderRadius: 8 }}
					/>
				</div>
				<CameraShare onCameraPress={handleImagePick} />
			</div>
		</div>
	);
}

export default App;
