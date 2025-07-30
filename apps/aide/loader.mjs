export async function resolve(specifier, context, defaultResolve) {
	try {
		return await defaultResolve(specifier, context);
	} catch (error) {
		if (error.code === 'ERR_MODULE_NOT_FOUND') {
			// Try various fallback resolutions for pnpm workspace issues
			const fallbacks = [
				specifier.replace(/^\.\.\/\.\.\//, './'),
				specifier.replace(/^@/, './node_modules/@'),
				specifier.replace(/^([^\/]+)/, './node_modules/$1')
			];

			for (const fallback of fallbacks) {
				try {
					return await defaultResolve(fallback, context);
				} catch {
					continue;
				}
			}
		}
		throw error;
	}
}
