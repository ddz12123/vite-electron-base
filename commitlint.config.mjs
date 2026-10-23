/**
 * 提交信息校验（Conventional Commits），由 .husky/commit-msg 触发。
 * 完整规则见 https://commitlint.js.org/reference/rules.html
 * 常用类型：feat fix docs style refactor perf test build ci chore revert
 */
export default {
  extends: ['@commitlint/config-conventional'],
};
