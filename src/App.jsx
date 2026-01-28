import { useEffect, useRef, useState } from "react";

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
		<div style={{ padding: 16 }}>
			<h2>Good Morning</h2>

			<input type="file" accept="image/*" onChange={handleImagePick} />

			<div style={{ marginTop: 12 }}>
				{presets.map((p) => (
					<button
						key={p}
						onClick={() => setText(p)}
						style={{ marginRight: 8 }}
					>
						{p}
					</button>
				))}
			</div>
			<button onClick={downloadImage}>Download</button>
			<button onClick={shareImage}>Share</button>

			<canvas
				ref={canvasRef}
				style={{ maxWidth: "100%", borderRadius: 8 }}
			/>

			{/* {image && (
				<div style={{ marginTop: 16, position: "relative" }}>
					<img
						src={image}
						alt="Selected"
						style={{ width: "100%", borderRadius: 8 }}
					/>

					{text && (
						<div
							style={{
								position: "absolute",
								bottom: 12,
								left: 0,
								right: 0,
								textAlign: "center",
								color: "white",
								fontSize: 24,
								fontWeight: "bold",
								textShadow: "0 2px 6px rgba(0,0,0,0.6)",
							}}
						>
							{text}
						</div>
					)}
				</div>
			)} */}
		</div>
	);
}

export default App;
