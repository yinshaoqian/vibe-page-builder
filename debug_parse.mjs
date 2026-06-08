import fs from 'fs';
import { parse, compileTemplate } from 'vue/compiler-sfc';

const content = fs.readFileSync('src/views/ComponentEditor.vue', 'utf8');
const { descriptor, errors } = parse(content, { filename: 'test.vue' });

console.log('Parse errors:', errors.length);
if (errors.length > 0) {
  const err = errors[0];
  console.log('Error:', err.message);
  if (err.loc) {
    console.log('Offset:', err.loc.start.offset, '-', err.loc.end.offset);
  }
}

const tpl = descriptor.template.content;

// Binary search to find which part of the template has the error
try {
  const result = compileTemplate({
    source: tpl,
    filename: 'test.vue',
    id: 'test-id'
  });
  console.log('Template compiles OK');
} catch(e) {
  console.log('Compile error:', e.message);
  if (e.loc) {
    console.log('Start line:', e.loc.start.line, 'col:', e.loc.start.column);
    const lines = tpl.split('\n');
    const startLine = Math.max(0, e.loc.start.line - 2);
    const endLine = Math.min(lines.length, e.loc.start.line + 2);
    for (let i = startLine; i < endLine; i++) {
      console.log(`L${i+1}: ${lines[i]}`);
    }
  }
}