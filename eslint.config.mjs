import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    "files": ["tests/**/*"],
    "plugins": ["jest"],
    "env": {
      "jest/globals": true
    }
  }
);