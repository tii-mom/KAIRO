# KAIRO I18N Localization V1 Documentation

This document describes the internationalization architecture and verification pipeline implemented for KAIRO.

## Architecture

We use a custom, type-safe React-based internationalization solution to avoid complex external i18n framework dependencies, keep bundle sizes small, and support hot-reloading language changes seamlessly.

- **Translation Keys & Locales**: Maintained in [client/i18n/locales.ts](file:///Users/yudeyou/Desktop/KAIRO/KAIRO/client/i18n/locales.ts). Supports:
  - English (`en-US`, default)
  - Simplified Chinese (`zh-CN`)
  - Korean (`ko-KR`)
- **I18n Provider**: Wrap the app router inside [src/main.tsx](file:///Users/yudeyou/Desktop/KAIRO/KAIRO/src/main.tsx) using the `<I18nProvider>` defined in [client/i18n/I18nProvider.tsx](file:///Users/yudeyou/Desktop/KAIRO/KAIRO/client/i18n/I18nProvider.tsx).
- **Hook**: Use the `useI18n()` hook in any component to retrieve the typed `t` (for strings) and `tArray` (for array-based texts like paragraphs) functions, and the current `locale` state.
- **Language Switcher**: Rendered in the top navigation shell ([client/RuntimeV2Shell.tsx](file:///Users/yudeyou/Desktop/KAIRO/KAIRO/client/RuntimeV2Shell.tsx)), allowing users to seamlessly change language settings.

## Verification Pipeline

To ensure that the internationalization coverage remains high and that no hardcoded English texts sneak back into production front-end code:

1. **Verify Coverage**: Run `npm run verify:i18n`. This executes [scripts/verify-i18n-coverage.ts](file:///Users/yudeyou/Desktop/KAIRO/KAIRO/scripts/verify-i18n-coverage.ts), which:
   - Scans the active frontend source directory (`client/`) and main layout files.
   - Extracts all user-visible text literals, JsxText, and JSX attributes (like `label`, `title`, `placeholder`).
   - Asserts key alignment across the translation dictionaries (`en-US`, `zh-CN`, `ko-KR`).
   - Validates that localization coverage is above `99%` (ignoring CSS classes, numbers, and technical terms in `ALLOWLIST`).
2. **Verify Copy Guidelines**: Run `npm run verify:copy`. This scans public runtime files to ensure no forbidden financial terms (e.g. buy/sell/deposit in target languages) are used.
