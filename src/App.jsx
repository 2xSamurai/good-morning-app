import { useEffect, useRef, useState } from "react";
import BtnCamera from "./components/BtnCamera";
import TextStyles from "./components/TextStyles";
import Header from "./components/Header";
import Step from "./components/Step";
import CameraShare from "./components/CameraShare";

function App() {
	const [imageFile, setImageFile] = useState(null);
	const [activeStyle, setActiveStyle] = useState(0);
	const [sliderValue, setSliderValue] = useState(85); // 0–100, maps to % of image height
	const canvasRef = useRef(null);

	useEffect(() => {
		if (imageFile) {
			drawCanvas(imageFile);
		}
	}, [imageFile, sliderValue, activeStyle]);

	function handleImagePick(e) {
		if (!e?.target?.files?.length) return;
		setImageFile(e.target.files[0]);
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
		{
			title: "Good Morning",
			style: {
				textAlign: "center",
				textColor: "white",
				bgColor: "black",
			},
		},
	];

	const drawCanvas = async (file) => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		// createImageBitmap with imageOrientation respects EXIF rotation from camera photos
		const bitmap = await createImageBitmap(file, {
			imageOrientation: "from-image",
		});

		canvas.width = bitmap.width;
		canvas.height = bitmap.height;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(bitmap, 0, 0);

		const fontSize = bitmap.width * 0.06;
		const padding = fontSize * 0.4;
		const radius = fontSize * 0.4;

		ctx.font = `${fontSize}px sans-serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		const textValue = textPresets[activeStyle]?.title || "Good Morning";
		const metrics = ctx.measureText(textValue);
		const textWidth = metrics.width;
		const textHeight = fontSize;

		const x = bitmap.width / 2;
		const y = ((100 - sliderValue) / 100) * bitmap.height;

		const boxWidth = textWidth + padding * 2;
		const boxHeight = textHeight + padding * 2;
		const boxX = x - boxWidth / 2;
		const boxY = y - boxHeight / 2;

		ctx.fillStyle = textPresets[activeStyle]?.style?.bgColor;
		drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, radius);
		ctx.fill();

		ctx.fillStyle = textPresets[activeStyle]?.style?.textColor;
		ctx.fillText(textValue, x, y);
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

	const dataURLtoBlob = (dataURL) => {
		const arr = dataURL.split(",");
		const mime = arr[0].match(/:(.*?);/)[1];
		const bstr = atob(arr[1]);
		const u8arr = new Uint8Array(bstr.length);
		for (let i = 0; i < bstr.length; i++) {
			u8arr[i] = bstr.charCodeAt(i);
		}
		return new Blob([u8arr], { type: mime });
	};

	const shareImage = async () => {
		const canvas = canvasRef.current;

		// Use synchronous toDataURL so we stay within the user gesture context
		// (toBlob is async and breaks navigator.share on iOS/Android)
		const dataURL = canvas.toDataURL("image/png");
		const blob = dataURLtoBlob(dataURL);
		const file = new File([blob], "good-morning.png", { type: "image/png" });

		try {
			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				await navigator.share({
					files: [file],
					title: "Good Morning",
					text: "Good Morning 🌞",
				});
			} else {
				// Desktop fallback: download the image
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "good-morning.png";
				a.click();
				URL.revokeObjectURL(url);
			}
		} catch (err) {
			if (err.name !== "AbortError") {
				// Share failed (e.g. HTTP instead of HTTPS) — fall back to download
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "good-morning.png";
				a.click();
				URL.revokeObjectURL(url);
			}
		}
	};

	return (
		<div className="main">
			<Header />
			<h1 style={{ textIndent: -9999999999, position: "absolute" }}>
				Good Morning App
			</h1>
			<div className={`ui-wrap ${imageFile ? "d-none" : ""}`}>
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
				<input
					id="input-file"
					className="input-file"
					type="file"
					accept="image/*"
					onChange={handleImagePick}
				/>
			</div>
			<div className={`ui-wrap-image ${imageFile ? "" : "d-none"}`}>
				<div className="ui-wrap-image-inner">
					<div className="ui-wrap-image-container">
						<canvas
							ref={canvasRef}
							style={{
								maxWidth: "100%",
								borderRadius: 8,
							}}
						/>
					</div>
					<div className="slider-wrap">
						<input
							type="range"
							min="5"
							max="95"
							value={sliderValue}
							onChange={(e) =>
								setSliderValue(Number(e.target.value))
							}
							className="text-position-slider"
						/>
						<div className="color-pallets">
							{textPresets?.length &&
								textPresets?.map((preset, index) => {
									return (
										<div
											key={preset?.title + " " + index}
											className="color-pallet"
											onClick={() => {
												setActiveStyle(index);
											}}
											style={{
												backgroundColor:
													preset?.style?.bgColor,
											}}
										></div>
									);
								})}
						</div>
					</div>
				</div>
				{/* <TextStyles presets={textPresets} setStyle={setActiveStyle} /> */}
				<CameraShare
					onCameraPress={handleImagePick}
					onSharePress={shareImage}
				/>
			</div>
		</div>
	);
}

export default App;
