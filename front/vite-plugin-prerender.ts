import { Plugin } from 'vite';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import * as fs from 'fs';
import * as path from 'path';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import App from './src/site/App';
import { routes } from './src/site/router';

export default function prerender(): Plugin {
  return {
    name: 'vite-plugin-prerender',
    enforce: 'post',
    writeBundle: async (options) => {
      const template = fs.readFileSync(path.resolve('dist/site/index.html'), 'utf-8');
      
      for (const route of routes) {
        const router = createMemoryRouter(routes, {
          initialEntries: [route.path],
        });

        const content = renderToString(
          createElement(RouterProvider, { router })
        );

        const html = template.replace(
          '<div id="root"></div>',
          `<div id="root">${content}</div>`
        );

        const outputPath = path.join(
          'dist/site',
          route.path === '/' ? 'index.html' : route.path.slice(1) + '.html'
        );

        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, html);
      }
    }
  };
} 