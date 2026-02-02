import { useEffect, useRef, useState } from "react";
import BtnCamera from "./components/BtnCamera";
import TextStyles from "./components/TextStyles";
import Header from "./components/Header";
import Step from "./components/Step";

function App() {
	const [image, setImage] = useState(null);
	const [text, setText] = useState("");
	const canvasRef = useRef(null);

	useEffect(() => {
		if (image || text) {
			console.log("image", image);
			drawCanvas(image, text);
		}
	}, [image, text]);

	function handleImagePick(e) {
		const file = e.target.files[0];
		if (!file) return;

		const url = URL.createObjectURL(file);
		setImage(url);
	}

	const presets = [
		"Good Morning 🌅",
		"Have a great day ☀️",
		"Wishing you a beautiful morning 🌸",
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
			ctx.font = "40px sans-serif";
			ctx.fillStyle = "white";
			ctx.textAlign = "center";
			ctx.fillText(text, canvas.width / 2, canvas.height - 50);

			const link = document.createElement("a");
			link.download = "good-morning.png";
			link.href = canvas.toDataURL("image/png");
			link.click();
		};
	};

	const drawCanvas = (imgSrc, text) => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		const img = new Image();
		img.src = imgSrc;

		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;

			ctx.drawImage(img, 0, 0);

			ctx.font = "40px sans-serif";
			ctx.fillStyle = "white";
			ctx.textAlign = "center";
			ctx.shadowColor = "black";
			ctx.shadowBlur = 4;

			ctx.fillText(text, canvas.width / 2, canvas.height - 50);
		};
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
			<div className="ui-wrap">
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
				{/* <TextStyles /> */}
				<input
					id="input-file"
					className="input-file"
					type="file"
					accept="image/*"
					onChange={handleImagePick}
				/>
			</div>
		</div>
	);
}

export default App;
