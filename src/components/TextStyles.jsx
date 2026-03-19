const TextStyles = ({ presets = [], setStyle = () => {} }) => {
	return (
		<div className="text-styles">
			{/* <h2>Good Morning</h2> */}

			{/* <input type="file" accept="image/*" onChange={handleImagePick} /> */}

			<div style={{ marginTop: 12 }}>
				{presets?.length &&
					presets?.map((preset, index) => {
						console.log("preset", presets);
						return (
							<button
								key={preset?.title + " " + index}
								onClick={() => setStyle(index)}
								style={{
									marginRight: 8,
									color: preset?.style?.textColor,
									backgroundColor: preset?.style?.bgColor,
									// font: preset?.style?.font,
									fontSize: 20,
									border: "none",
									borderRadius: 20 * 0.4,
									padding: 20 * 0.4,
								}}
							>
								{preset?.title}
							</button>
						);
					})}
			</div>
			{/* <button onClick={downloadImage}>Download</button>
			<button onClick={shareImage}>Share</button>

			<canvas
				ref={canvasRef}
				style={{ maxWidth: "100%", borderRadius: 8 }}
			/> */}
		</div>
	);
};

export default TextStyles;
