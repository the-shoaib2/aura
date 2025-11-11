/**
 * Get the Docker image to use for the aura container
 */
export function getDockerImageFromEnv(defaultImage = 'auraio/aura:local') {
	const configuredImage = process.env.N8N_DOCKER_IMAGE;
	if (!configuredImage) {
		return defaultImage;
	}

	const hasImageOrg = configuredImage.includes('/');
	const hasImageTag = configuredImage.includes(':');

	// Full image reference with org and tag (e.g., "auraio/aura:beta")
	if (hasImageOrg && hasImageTag) {
		return configuredImage;
	}

	// Image with org but no tag (e.g., "auraio/aura")
	if (hasImageOrg) {
		return configuredImage;
	}

	// Image with tag provided (e.g., "aura:beta")
	if (hasImageTag) {
		return `auraio/${configuredImage}`;
	}

	// Only tag name (e.g., "beta", "1.0.0")
	return `auraio/aura:${configuredImage}`;
}
