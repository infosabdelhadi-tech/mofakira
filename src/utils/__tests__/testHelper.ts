import { strict as assert } from 'assert';
export { assert };

export const describe = async (name: string, fn: () => void | Promise<void>) => {
  console.log(`\n=== [اختبار] ${name} ===`);
  try {
    await fn();
    console.log(`✓ نجح الاختبار: ${name}`);
  } catch (err: any) {
    console.error(`✗ فشل الاختبار: ${name}`);
    console.error(err);
    process.exit(1);
  }
};
