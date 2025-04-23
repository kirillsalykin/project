import { Plugin } from 'vite';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { createElement } from 'react';
import * as fs from 'fs';
import * as path from 'path';

// Import your App component and routes
import App from './src/site/App';

const routes = ['/', '/about'];

export default function prerender(): Plugin {
  return {
    name: 'vite-plugin-prerender',
    enforce: 'post',
    writeBundle: async (options) => {
      const template = fs.readFileSync(path.resolve('dist/site/index.html'), 'utf-8');
      
      for (const route of routes) {
        const content = renderToString(
          createElement(StaticRouter, { location: route },
            createElement(App)
          )
        );

        const html = template.replace(
          '<div id="root"></div>',
          `<div id="root">${content}</div>`
        );

        const outputPath = path.join(
          'dist/site',
          route === '/' ? 'index.html' : route.slice(1) + '.html'
        );

        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, html);
      }
    }
  };
} 