/**
 * @module simulation/sequences/types
 * @description 烟花发射序列的共享类型定义。
 */

/**
 * 发射序列名称类型。
 * 由于注册表是运行时动态的，使用 string 作为基础类型。
 */
type LaunchSequenceName = string;

export { type LaunchSequenceName };
