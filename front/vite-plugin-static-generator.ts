/// <reference types="node" />
import { Plugin } from 'vite';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import fs from 'fs';
import path from 'path';
import { createRouterForRoute } from './src/site/router';

export default function staticGenerator(): Plugin {
  return {
    name: 'vite-plugin-static-generator',
    async buildEnd() {
      const routes = ['/', '/about'];
      const template = fs.readFileSync(path.resolve(__dirname, 'src/site/index.html'), 'utf-8');

      for (const route of routes) {
        // Create a new router instance for each route
        const router = createRouterForRoute(route);

        // Render the React component for this route
        const content = renderToString(
          createElement(router.Provider)
        );

        // Replace placeholders in template
        const html = template
          .replace('<div id="root"></div>', `<div id="root">${content}</div>`)
          .replace('<title>', `<title>${getTitleForRoute(route)} - `);

        // Write the static HTML file
        const outputPath = path.resolve(__dirname, `dist/site${route === '/' ? '/index' : route}.html`);
        fs.writeFileSync(outputPath, html);
      }
    }
  };
}

function getTitleForRoute(route: string): string {
  switch (route) {
    case '/':
      return 'Our Company';
    case '/about':
      return 'About Us';
    default:
      return 'Our Company';
  }
} 