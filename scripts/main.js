async function updateTokenHeight(tokenDoc) {
	const actor = tokenDoc.actor;
	if (!actor) return;
	const actorType = actor.type;
	let height = 1;
	if (actorType === "character") {
		height = actor.system?.height ?? 1;
	} else if (actorType === "pokemon") {
		height = actor._itemTypes?.species[0]?.system?.size?.height ?? 1;
	}
	height = Math.max(0.1, Math.min(height, 10));
	await actor.update({
		"prototypeToken.flags.isometric-perspective.isoAnchorX": 0.5,
		"prototypeToken.flags.isometric-perspective.isoAnchorY": 0.5,
		"prototypeToken.flags.isometric-perspective.offsetX": (0.25 * (100 * height)),
		"prototypeToken.flags.isometric-perspective.offsetY": 0,
		"prototypeToken.flags.isometric-perspective.scale": height,
		"prototypeToken.texture.anchorX": 0.5,
		"prototypeToken.texture.anchorY": 0.5,
		"prototypeToken.texture.offsetX": 0,
		"prototypeToken.texture.offsetY": (0.25 * (100 * height)),
		"prototypeToken.texture.scaleX": height,
		"prototypeToken.texture.scaleY": height,
		"prototypeToken.texture.fit": "height"
	});
	if (canvas.scene.getFlag("isometric-perspective", "isometricEnabled") == true) {
		try {
			const mode = canvas.scene.getFlag("isometric-perspective", "projectionType");
			let perspectiveFactor = 1;
			switch (mode) {
				case "Overhead (√2:1)":
					perspectiveFactor = 1 - 0.414;
					break;
			}
			const scaleY = height * perspectiveFactor;
			await tokenDoc.update({
				"flags.isometric-perspective.isoAnchorX": 0.5,
				"flags.isometric-perspective.isoAnchorY": 0.5,
				"flags.isometric-perspective.offsetX": (0.85 * (100 * scaleY)),
				"flags.isometric-perspective.offsetY": 0,
				"flags.isometric-perspective.scale": scaleY,
				"texture.anchorX": 0.5,
				"texture.anchorY": 0.5,
				"texture.offsetX": 0,
				"texture.offsetY": (0.85 * (100 * scaleY)),
				"texture.scaleX": scaleY,
				"texture.scaleY": scaleY,
				"texture.fit": "height"
			});
		} catch (e) {
			
		}
	}
}


Hooks.on("createToken", async (tokenDoc) => {
	await updateTokenHeight(tokenDoc);
});

Hooks.on("updateToken", async (tokenDoc) => {
	await updateTokenHeight(tokenDoc);
});

Hooks.on("updateActor", async (actor) => {
	const tokens = actor.getActiveTokens();
	for (const token of tokens) {
		await updateTokenHeight(token.document);
	}
});
Hooks.on("moveToken", async (tokenDoc) => {
	await updateTokenHeight(tokenDoc);
});

Hooks.on("createActor", async (actor) => {
	const tokens = actor.getActiveTokens();
	for (const token of tokens) {
		await updateTokenHeight(token.document);
	}
});

Hooks.on("ready", () => {
	for (const scene of game.scenes) {
		for (const token of scene.tokens) {
			if (token.actor) updateTokenHeight(token);
		}
	}
});

Hooks.on("canvasReady", () => {
	for (const token of canvas.tokens.placeables) {
		if (token.actor) updateTokenHeight(token.document);
	}
});