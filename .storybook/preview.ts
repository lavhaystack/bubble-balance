import type { Preview } from "@storybook/nextjs-vite";
import { ThemeProvider } from "next-themes";
import { createElement } from "react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  PathnameContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";

import "../app/globals.css";

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        AppRouterContext.Provider,
        {
          value: {
            back: () => undefined,
            forward: () => undefined,
            refresh: () => undefined,
            hmrRefresh: () => undefined,
            push: () => undefined,
            replace: () => undefined,
            prefetch: async () => undefined,
          },
        },
        createElement(
          PathnameContext.Provider,
          { value: "/" },
          createElement(
            SearchParamsContext.Provider,
            { value: new URLSearchParams() },
            createElement(
              ThemeProvider,
              {
                attribute: "class",
                defaultTheme: "light",
                enableSystem: false,
                disableTransitionOnChange: true,
              },
              createElement(Story),
            ),
          ),
        ),
      ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;