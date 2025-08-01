// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "Renumerate JS",
			customCss: ["./src/styles/custom.css"],
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/renumerate/renumerate-js",
				},
			],
			sidebar: [
				{
                    label: "Guides",
                    items: [
                        { label: "Get Started", slug: "guides/getting-started" },
						{ label: "Subscription Hub", slug: "guides/subscription-hub" },
                        { label: "Retention Flow", slug: "guides/retention-flow" },
						{ label: "How-To Guide", slug: "guides/how-to" },
                    ],
                },
				{
					label: "Reference",
					autogenerate: { directory: "reference" },
				},
			],
		}),
	],
});
