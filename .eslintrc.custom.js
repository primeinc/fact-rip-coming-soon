module.exports = {
  rules: {
    'no-direct-storage': {
      create(context) {
        const BANNED_GLOBALS = ['localStorage', 'sessionStorage'];
        const ALLOWED_FILES = [
          'storage-adapter.ts',
          'storage.ts',
          'test-utils.ts'
        ];

        return {
          MemberExpression(node) {
            const filename = context.getFilename();
            const isAllowedFile = ALLOWED_FILES.some(allowed =>
              filename.includes(allowed)
            );

            if (isAllowedFile) return;

            if (node.object.type === 'Identifier' &&
                BANNED_GLOBALS.includes(node.object.name)) {
              context.report({
                node,
                message: `Direct ${node.object.name} access forbidden. Use StorageContext instead.`
              });
            }
          }
        };
      }
    }
  }
};