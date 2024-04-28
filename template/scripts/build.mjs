
import * as esbuild from 'esbuild';

if (process.argv.length >= 3 && process.argv[2] == '--watch') {
    const ctx = await esbuild.context({
        entryPoints: [
            "src/index.html",
            "src/app.ts"
        ],
        bundle: true,
        outdir: 'devtemp',
        write: false,
        format: 'esm',
        sourcemap: true,
        loader: {
            ".tsx": "tsx",
            ".html": "copy",
            ".css": "css"
        },
        banner: {
            js: `new EventSource('/esbuild').addEventListener('change', e => {
                const { added, removed, updated } = JSON.parse(e.data)
              
                if (!added.length && !removed.length && updated.length === 1) {
                  for (const link of document.getElementsByTagName("link")) {
                    const url = new URL(link.href)
              
                    if (url.host === location.host && url.pathname === updated[0]) {
                      const next = link.cloneNode()
                      next.href = updated[0] + '?' + Math.random().toString(36).slice(2)
                      next.onload = () => link.remove()
                      link.parentNode.insertBefore(next, link.nextSibling)
                      return
                    }
                  }
                }
    
                location.reload()
              }) `
        },
        plugins: [{
            name: "rebuildWatcher",
            setup(build) {
                build.onStart(() => {
                    console.log('Rebuilding...')
                })
            }
        }],
    });
    await ctx.watch();

    let { port } = await ctx.serve({
        servedir: 'devtemp/',
    });

    console.log(`Serving on http://localhost:${port}`);

} else {
    await esbuild.build({
        entryPoints: [
            "src/index.html",
            "src/app.ts"
        ],
        bundle: true,
        outdir: 'dist',
        format: 'esm',
        sourcemap: true,
        loader: {
            ".tsx": "tsx",
            ".html": "copy",
            ".css": "css"
        },
        dropLabels: ["DEV"],
        plugins: [],
    })
}
