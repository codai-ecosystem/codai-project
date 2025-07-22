import { NextRequest, NextResponse } from 'next/server';
// import { verifyAuth } from '../../../../../lib/auth-middleware';

interface ExecuteRequest {
	code: string;
	language?: string;
	filename?: string;
	projectId?: string;
}

export async function POST(request: NextRequest) {
	try {
		// TODO: Re-enable auth when fixed
		// const user = await verifyAuth(request);
		// if (!user) {
		// 	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		// }

		const { code, language = 'javascript', filename, projectId }: ExecuteRequest = await request.json();

		if (!code?.trim()) {
			return NextResponse.json({ error: 'Code is required' }, { status: 400 });
		}

		// For demo purposes, we'll create a simple preview for web technologies
		let previewUrl: string | null = null;
		let previewContent: string | null = null;

		if (language === 'html' || language === 'javascript' || language === 'typescript') {
			// Create a simple HTML preview
			const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Live Preview - ${filename || 'Code Preview'}</title>
	<script src="https://cdn.tailwindcss.com"></script>
	<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
	<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
	<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
	<div id="root"></div>
	<script type="text/babel">
		try {
			${code}
		} catch (error) {
			document.getElementById('root').innerHTML = \`<div class="p-8 bg-red-50 border border-red-200 rounded-lg m-4"><h2 class="text-red-800 text-lg font-semibold mb-2">Execution Error</h2><pre class="text-red-600 text-sm">\${error.message}</pre></div>\`;
		}
	</script>
</body>
</html>`;

			// For a real implementation, you would save this to a temporary file
			// and serve it via a preview server. For now, we'll return the HTML content.
			previewContent = htmlTemplate;
			previewUrl = `data:text/html;base64,${Buffer.from(htmlTemplate).toString('base64')}`;
		}

		// For other languages, provide a different approach
		if (!previewUrl) {
			const codePreviewTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Code Preview - ${filename || 'Code'}</title>
	<script src="https://cdn.tailwindcss.com"></script>
	<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css" rel="stylesheet">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${language}.min.js"></script>
</head>
<body class="bg-gray-50">
	<div class="container mx-auto p-6">
		<div class="bg-white rounded-lg shadow-lg overflow-hidden">
			<div class="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
				<span class="font-mono text-sm">${filename || 'preview.' + language}</span>
				<span class="text-xs bg-gray-700 px-2 py-1 rounded">${language}</span>
			</div>
			<pre class="p-4 text-sm overflow-auto"><code class="language-${language}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
		</div>
		<div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
			<h3 class="text-blue-800 font-semibold">Preview Information</h3>
			<p class="text-blue-600 text-sm mt-1">
				This is a code preview for ${language} files.
				For executable languages, this would run in a sandboxed environment.
			</p>
		</div>
	</div>
	<script>Prism.highlightAll();</script>
</body>
</html>`;
			previewContent = codePreviewTemplate;
			previewUrl = `data:text/html;base64,${Buffer.from(codePreviewTemplate).toString('base64')}`;
		}

		return NextResponse.json({
			success: true,
			previewUrl,
			previewContent,
			language,
			filename,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('Preview execution error:', error);
		return NextResponse.json(
			{ error: 'Failed to execute code preview' },
			{ status: 500 }
		);
	}
}
