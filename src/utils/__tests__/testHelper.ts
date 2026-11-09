import { strict as assert } from 'assert';
export { assert };

export const describe = (name: string, fn: () => void) => {
  console.log(`\n=== [اختبار] ${name} ===`);
  try {
    fn();
    console.log(`✓ نجح الاختبار: ${name}`);
  } catch (err: any) {
    console.error(`✗ فشل الاختبار: ${name}`);
    console.error(err);
    process.exit(1);
  }
};
